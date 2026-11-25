import { MongoClient } from "mongodb";
import Stripe from "stripe";

const apply = process.argv.includes("--apply");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const databaseUrl = process.env.BETTER_AUTH_DB_URL;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing from the environment");
}

if (!databaseUrl) {
  throw new Error("BETTER_AUTH_DB_URL is missing from the environment");
}

const stripe = new Stripe(stripeSecretKey);
const mongo = new MongoClient(databaseUrl);

const summary = {
  sessionsScanned: 0,
  paidSessions: 0,
  sellerProductSessions: 0,
  matchedSellers: 0,
  existingRecords: 0,
  recordsWritten: 0,
  wouldWrite: 0,
};
const skipped = [];

try {
  await mongo.connect();

  const db = mongo.db("markro");
  const users = await db.collection("user").find({}).toArray();
  const payments = db.collection("payments");

  await payments.createIndex({ sessionId: 1 }, { unique: true });

  const usersById = new Map(
    users.map((user) => [String(user._id), user]),
  );
  const usersByEmail = new Map(
    users
      .filter((user) => typeof user.email === "string" && user.email)
      .map((user) => [user.email.toLowerCase(), user]),
  );

  for await (const session of stripe.checkout.sessions.list({
    limit: 100,
    status: "complete",
  })) {
    summary.sessionsScanned += 1;

    if (session.payment_status !== "paid") {
      continue;
    }

    summary.paidSessions += 1;

    if (session.metadata?.product !== "seller_pro") {
      skipped.push({
        sessionId: session.id,
        reason: "not a seller_pro checkout",
        metadata: session.metadata ?? null,
      });
      continue;
    }

    summary.sellerProductSessions += 1;

    const metadataUserId = session.metadata?.userId;
    const userId = session.client_reference_id ?? metadataUserId ?? "";
    let user = userId ? usersById.get(String(userId)) : undefined;

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      (typeof user?.email === "string" ? user.email : "");

    if (!user && email) {
      user = usersByEmail.get(email.toLowerCase());
    }

    if (!user) {
      skipped.push({
        sessionId: session.id,
        reason: "no matching seller user",
        email: email || null,
        userId: userId || null,
      });
      continue;
    }

    const role = String(user.role ?? "").toLowerCase();

    if (role !== "seller") {
      skipped.push({
        sessionId: session.id,
        reason: `matching user has role ${role || "none"}`,
        email,
      });
      continue;
    }

    summary.matchedSellers += 1;

    const existing = await payments.findOne({ sessionId: session.id });

    if (existing) {
      summary.existingRecords += 1;
      continue;
    }

    const paidAt = new Date((session.created ?? Date.now() / 1000) * 1000);
    const record = {
      userId: String(user._id),
      sessionId: session.id,
      amountCents: session.amount_total ?? 2000,
      currency: session.currency ?? "usd",
      product: "seller_pro",
      status: "paid",
      email:
        email || (typeof user.email === "string" ? user.email : ""),
      paidAt,
      createdAt: paidAt,
    };

    if (!apply) {
      summary.wouldWrite += 1;
      continue;
    }

    await payments.updateOne(
      { sessionId: session.id },
      {
        $setOnInsert: { createdAt: record.createdAt },
        $set: {
          userId: record.userId,
          sessionId: record.sessionId,
          amountCents: record.amountCents,
          currency: record.currency,
          product: record.product,
          status: record.status,
          email: record.email,
          paidAt: record.paidAt,
        },
      },
      { upsert: true },
    );
    summary.recordsWritten += 1;
  }
} finally {
  await mongo.close();
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "applied" : "dry-run",
      summary,
      skipped: skipped.slice(0, 25),
      skippedTotal: skipped.length,
    },
    null,
    2,
  ),
);
