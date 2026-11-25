import { MongoClient } from "mongodb";

const MIGRATION_NAME = "ad-prices-usd-v1";
const client = new MongoClient(process.env.BETTER_AUTH_DB_URL);

try {
  await client.connect();
  const db = client.db("markro");
  const migrations = db.collection("migrations");

  if (await migrations.findOne({ name: MIGRATION_NAME })) {
    console.log(`${MIGRATION_NAME}: already applied`);
  } else {
    const ads = await db
      .collection("adsposts")
      .find({ price: { $type: "number" } }, { projection: { price: 1 } })
      .toArray();

    if (ads.length > 0) {
      await db.collection("adsposts").bulkWrite(
        ads.map((ad) => ({
          updateOne: {
            filter: { _id: ad._id },
            update: {
              $set: {
                price: Number((Number(ad.price) / 100).toFixed(2)),
              },
            },
          },
        })),
      );
    }

    await migrations.insertOne({
      name: MIGRATION_NAME,
      migratedCount: ads.length,
      migratedAt: new Date(),
    });

    console.log(`${MIGRATION_NAME}: updated ${ads.length} ad prices`);
  }
} finally {
  await client.close();
}
