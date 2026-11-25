import "server-only";

import { MongoClient, ObjectId, type Db } from "mongodb";

const url = (() => {
  const value = process.env.BETTER_AUTH_DB_URL;

  if (!value) {
    throw new Error("BETTER_AUTH_DB_URL is missing from environment variables");
  }

  return value;
})();

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function getMongoClientPromise() {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(url).connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function getPaymentsDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db("markro");
}

export type StoredSellerPayment = {
  userId: string;
  sessionId: string;
  amountCents: number;
  currency: string;
  product: string;
  status: "paid";
  email: string;
  paidAt: Date;
  createdAt: Date;
};

export type SerializedSellerPayment = Omit<
  StoredSellerPayment,
  "paidAt" | "createdAt"
> & {
  id: string;
  paidAt: string;
  createdAt: string;
};

const serializePayment = (
  payment: StoredSellerPayment & { _id?: { toString(): string } },
): SerializedSellerPayment => ({
  id: payment._id?.toString() ?? payment.sessionId,
  userId: payment.userId,
  sessionId: payment.sessionId,
  amountCents: payment.amountCents,
  currency: payment.currency,
  product: payment.product,
  status: payment.status,
  email: payment.email,
  paidAt: new Date(payment.paidAt).toISOString(),
  createdAt: new Date(payment.createdAt).toISOString(),
});

export const FREE_AD_LIMIT = 2;
const SELLER_PRO_PRODUCT = "seller_pro";

export async function hasPaidSellerPayment(userId: string) {
  const db = await getPaymentsDb();
  const payment = await db.collection("payments").findOne(
    { userId, status: "paid", product: SELLER_PRO_PRODUCT },
    { projection: { _id: 1 } },
  );

  return Boolean(payment);
}

export async function getSellerPayments(userId: string) {
  const db = await getPaymentsDb();
  const payments = await db
    .collection<StoredSellerPayment>("payments")
    .find({ userId, status: "paid", product: SELLER_PRO_PRODUCT })
    .sort({ paidAt: -1 })
    .toArray();

  return payments.map(serializePayment);
}

type StoredAdminPayment = Omit<StoredSellerPayment, "status"> & {
  status: string;
  paidAt?: Date;
  createdAt?: Date;
  adId?: string;
  adTitle?: string;
};

export type AdminPaymentRecord = Omit<SerializedSellerPayment, "status"> & {
  status: string;
  adId: string;
  adTitle: string;
  sellerName: string;
  sellerEmail: string;
};

const serializeAdminPayment = (
  payment: StoredAdminPayment & { _id?: { toString(): string } },
): AdminPaymentRecord => ({
  id: payment._id?.toString() ?? payment.sessionId,
  userId: String(payment.userId ?? ""),
  sessionId: String(payment.sessionId ?? ""),
  amountCents: Number(payment.amountCents ?? 0),
  currency: String(payment.currency ?? "usd"),
  product: String(payment.product ?? ""),
  status: String(payment.status ?? "paid"),
  email: String(payment.email ?? ""),
  paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : "",
  createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : "",
  adId: String(payment.adId ?? ""),
  adTitle: String(payment.adTitle ?? ""),
  sellerName: "",
  sellerEmail: "",
});

export async function getAllPaymentsForAdmin(): Promise<AdminPaymentRecord[]> {
  const db = await getPaymentsDb();

  const [payments, users] = await Promise.all([
    db
      .collection<StoredAdminPayment>("payments")
      .find({})
      .sort({ paidAt: -1 })
      .toArray(),
    db
      .collection<{ name?: string; email?: string }>("user")
      .find({}, { projection: { name: 1, email: 1 } })
      .toArray(),
  ]);

  const usersById = new Map(users.map((user) => [String(user._id), user]));

  return payments.map((payment) => {
    const user = usersById.get(String(payment.userId));
    const serialized = serializeAdminPayment(payment);

    return {
      ...serialized,
      sellerName: user?.name ?? "Unknown seller",
      sellerEmail: user?.email || payment.email || "",
    };
  });
}

type RecordPaymentInput = {
  userId: string;
  sessionId: string;
  amountCents: number;
  currency: string;
  email: string;
};

export async function recordSellerPayment(input: RecordPaymentInput) {
  const db = await getPaymentsDb();
  const collection = db.collection<StoredSellerPayment>("payments");

  await collection.createIndex({ sessionId: 1 }, { unique: true });

  const now = new Date();
  const filter = { sessionId: input.sessionId };

  await collection.updateOne(
    filter,
    {
      $setOnInsert: { createdAt: now },
      $set: {
        userId: input.userId,
        sessionId: input.sessionId,
        amountCents: input.amountCents,
        currency: input.currency,
        product: SELLER_PRO_PRODUCT,
        status: "paid",
        email: input.email,
        paidAt: now,
      },
    },
    { upsert: true },
  );

  const payment = await collection.findOne(filter);

  if (!payment) {
    throw new Error("Unable to save the payment record.");
  }

  return serializePayment(payment);
}

export async function getSellerAdCount(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return 0;
  }

  const db = await getPaymentsDb();
  return db.collection("adsposts").countDocuments({
    sellerID: new ObjectId(userId),
  });
}

export async function getSellerPostingStatus(userId: string) {
  const [isPaid, adCount] = await Promise.all([
    hasPaidSellerPayment(userId),
    getSellerAdCount(userId),
  ]);

  return {
    isPaid,
    adCount,
    freeAdLimit: FREE_AD_LIMIT,
    canPost: isPaid || adCount < FREE_AD_LIMIT,
  };
}
