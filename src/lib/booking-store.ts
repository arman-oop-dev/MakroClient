import "server-only";

import { ObjectId, type Db } from "mongodb";

import { RENTAL_PRODUCT } from "@/lib/booking";
import { getPaymentsDb } from "@/lib/payment-store";

export type StoredBooking = {
  userId: string;
  userEmail: string;
  adId: string;
  adTitle: string;
  sellerId: string;
  sessionId: string;
  amountCents: number;
  currency: string;
  rentType: string;
  status: "paid";
  paidAt: Date;
  createdAt: Date;
};

export type SerializedBooking = Omit<
  StoredBooking,
  "paidAt" | "createdAt"
> & {
  id: string;
  paidAt: string;
  createdAt: string;
};

const serializeBooking = (
  booking: StoredBooking & { _id?: { toString(): string } },
): SerializedBooking => ({
  id: booking._id?.toString() ?? booking.sessionId,
  userId: booking.userId,
  userEmail: booking.userEmail,
  adId: booking.adId,
  adTitle: booking.adTitle,
  sellerId: booking.sellerId,
  sessionId: booking.sessionId,
  amountCents: booking.amountCents,
  currency: booking.currency,
  rentType: booking.rentType,
  status: booking.status,
  paidAt: new Date(booking.paidAt).toISOString(),
  createdAt: new Date(booking.createdAt).toISOString(),
});

type RecordBookingInput = {
  userId: string;
  userEmail: string;
  adId: string;
  adTitle: string;
  sellerId: string;
  sessionId: string;
  amountCents: number;
  currency: string;
  rentType: string;
};

async function decrementAdQuantity(db: Db, adId: string) {
  if (!ObjectId.isValid(adId)) {
    return false;
  }

  const updatedAd = await db.collection("adsposts").findOneAndUpdate(
    {
      _id: new ObjectId(adId),
      status: "approved",
      quantity: { $gte: 1 },
    },
    { $inc: { quantity: -1 } },
    { returnDocument: "after" },
  );

  return Boolean(updatedAd);
}

export type RecordBookingResult = {
  booking: SerializedBooking;
  bookingCreated: boolean;
  quantityUpdated: boolean;
};

export async function recordBuyerBooking(
  input: RecordBookingInput,
): Promise<RecordBookingResult> {
  const db = await getPaymentsDb();
  const now = new Date();
  const bookings = db.collection<StoredBooking>("bookings");
  const payments = db.collection("payments");

  await Promise.all([
    bookings.createIndex({ sessionId: 1 }, { unique: true }),
    payments.createIndex({ sessionId: 1 }, { unique: true }),
  ]);

  const bookingUpdate = await bookings.updateOne(
    { sessionId: input.sessionId },
    {
      $setOnInsert: { createdAt: now },
      $set: {
        ...input,
        status: "paid",
        paidAt: now,
      },
    },
    { upsert: true },
  );

  const quantityUpdated =
    bookingUpdate.upsertedCount > 0
      ? await decrementAdQuantity(db, input.adId)
      : false;

  await payments.updateOne(
    { sessionId: input.sessionId },
    {
      $setOnInsert: { createdAt: now },
      $set: {
        userId: input.userId,
        sessionId: input.sessionId,
        amountCents: input.amountCents,
        currency: input.currency,
        product: RENTAL_PRODUCT,
        status: "paid",
        email: input.userEmail,
        adId: input.adId,
        adTitle: input.adTitle,
        paidAt: now,
      },
    },
    { upsert: true },
  );

  const booking = await bookings.findOne({ sessionId: input.sessionId });

  if (!booking) {
    throw new Error("Unable to save the rental booking.");
  }

  return {
    booking: serializeBooking(booking),
    bookingCreated: bookingUpdate.upsertedCount > 0,
    quantityUpdated,
  };
}

export async function getBuyerBookings(
  userId: string,
): Promise<SerializedBooking[]> {
  const db = await getPaymentsDb();
  const bookings = await db
    .collection<StoredBooking>("bookings")
    .find({ userId, status: "paid" })
    .sort({ paidAt: -1 })
    .toArray();

  return bookings.map(serializeBooking);
}

export type BuyerRentalPayment = {
  id: string;
  sessionId: string;
  amountCents: number;
  currency: string;
  adId: string;
  adTitle: string;
  paidAt: string;
};

export async function getBuyerRentalPayments(
  userId: string,
): Promise<BuyerRentalPayment[]> {
  const db = await getPaymentsDb();
  const payments = await db
    .collection("payments")
    .find({ userId, status: "paid", product: RENTAL_PRODUCT })
    .sort({ paidAt: -1 })
    .toArray();

  return payments.map((payment) => ({
    id: payment._id.toString(),
    sessionId: String(payment.sessionId ?? ""),
    amountCents: Number(payment.amountCents ?? 0),
    currency: String(payment.currency ?? "usd"),
    adId: String(payment.adId ?? ""),
    adTitle: String(payment.adTitle ?? ""),
    paidAt: new Date(payment.paidAt ?? payment.createdAt ?? 0).toISOString(),
  }));
}
