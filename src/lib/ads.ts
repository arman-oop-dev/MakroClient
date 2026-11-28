import "server-only";

import { ObjectId, type Db } from "mongodb";

import type { BrowseAd } from "@/components/BrowseUI/ProductCard";
import { getPaymentsDb } from "@/lib/payment-store";

type AdDocument = Record<string, unknown> & { _id: ObjectId };

const readParams = (params: URLSearchParams, key: string) =>
  params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildAdFilter = (suffix: string) => {
  const params = new URLSearchParams(suffix.replace(/^\?/, ""));
  const filter: Record<string, unknown> = { status: "approved" };

  const category = readParams(params, "category");
  const city = readParams(params, "city");
  const rentType = readParams(params, "rentType");
  const searches = readParams(params, "search");

  if (category.length) filter.category = { $in: category };
  if (city.length) filter.city = { $in: city };
  if (rentType.length) filter.rentType = { $in: rentType };

  if (searches.length) {
    filter.$or = searches.flatMap((search) => {
      const pattern = new RegExp(escapeRegExp(search), "i");

      return [{ title: pattern }, { description: pattern }];
    });
  }

  const parsedLimit = Number.parseInt(readParams(params, "limit")[0] ?? "", 10);
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 0;

  const sort: Record<string, 1 | -1> =
    readParams(params, "sort")[0] === "price"
      ? { price: 1, createdAt: -1 }
      : { createdAt: -1 };

  return { filter, limit, sort };
};

const serializeAds = async (db: Db, docs: AdDocument[]): Promise<BrowseAd[]> => {
  const sellerIds = [
    ...new Set(
      docs
        .map((doc) => String(doc.sellerID ?? ""))
        .filter((id) => ObjectId.isValid(id)),
    ),
  ].map((id) => new ObjectId(id));

  const sellers = sellerIds.length
    ? await db
        .collection("user")
        .find({ _id: { $in: sellerIds } })
        .project({ _id: 1, name: 1, email: 1, image: 1 })
        .toArray()
    : [];

  const sellerMap = new Map(
    sellers.map((seller) => [
      String(seller._id),
      {
        _id: String(seller._id),
        name: typeof seller.name === "string" ? seller.name : undefined,
        email: typeof seller.email === "string" ? seller.email : undefined,
        image: typeof seller.image === "string" ? seller.image : undefined,
      },
    ]),
  );

  return docs.map((doc) => {
    const sellerKey = String(doc.sellerID ?? "");
    const createdAt =
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : undefined;

    return {
      _id: String(doc._id),
      title: typeof doc.title === "string" ? doc.title : "",
      category: typeof doc.category === "string" ? doc.category : undefined,
      city: typeof doc.city === "string" ? doc.city : undefined,
      location: typeof doc.location === "string" ? doc.location : undefined,
      price: Number(doc.price ?? 0),
      rentType: typeof doc.rentType === "string" ? doc.rentType : undefined,
      quantity: typeof doc.quantity === "number" ? doc.quantity : undefined,
      description:
        typeof doc.description === "string" ? doc.description : undefined,
      image: typeof doc.image === "string" ? doc.image : "",
      sellerID: sellerMap.get(sellerKey) ?? sellerKey,
      status: typeof doc.status === "string" ? doc.status : undefined,
      terms_condition:
        typeof doc.terms_condition === "string"
          ? doc.terms_condition
          : undefined,
      createdAt,
    };
  });
};

const getAdsFromDb = async (suffix: string): Promise<BrowseAd[]> => {
  const { filter, limit, sort } = buildAdFilter(suffix);
  const db = await getPaymentsDb();

  let cursor = db.collection<AdDocument>("adsposts").find(filter).sort(sort);

  if (limit) {
    cursor = cursor.limit(limit);
  }

  const docs = await cursor.toArray();

  return serializeAds(db, docs);
};

export async function getAds(suffix = ""): Promise<BrowseAd[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/ads${suffix}`,
        { cache: "no-store" },
      );

      if (response.ok) {
        const result = await response.json().catch(() => null);

        if (Array.isArray(result?.data)) {
          return (result.data as BrowseAd[]).filter(
            (ad) => !ad.status || ad.status === "approved",
          );
        }
      }
    } catch (error) {
      console.warn(
        "Ads API unavailable; reading approved ads from MongoDB instead.",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return getAdsFromDb(suffix);
}

export async function getApprovedAdById(
  adId: string,
): Promise<BrowseAd | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/ads`, {
        cache: "no-store",
      });

      if (response.ok) {
        const result = await response.json().catch(() => null);
        const ads = Array.isArray(result?.data) ? (result.data as BrowseAd[]) : [];
        const match = ads.find(
          (ad) =>
            ad._id === adId && (!ad.status || ad.status === "approved"),
        );

        if (match) return match;
      }
    } catch (error) {
      console.warn(
        "Ads API unavailable; reading ad from MongoDB instead.",
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (!ObjectId.isValid(adId)) {
    return null;
  }

  const db = await getPaymentsDb();
  const doc = await db.collection<AdDocument>("adsposts").findOne({
    _id: new ObjectId(adId),
    status: "approved",
  });

  if (!doc) {
    return null;
  }

  const [ad] = await serializeAds(db, [doc]);

  return ad ?? null;
}
