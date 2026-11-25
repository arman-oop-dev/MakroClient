import { SELLER_PRODUCT_NAME } from "@/lib/payment";

export const RENTAL_PRODUCT = "ad_rental";
export const RENTAL_PRODUCT_NAME = "Markro Equipment Rental";

const rentTypeLabels: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

export const getRentLabel = (rentType?: string) =>
  rentTypeLabels[rentType ?? "day"] ?? "day";

export const getAdPriceInCents = (price: number) => {
  const amount = Math.round(Number(price) * 100);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("This ad does not have a valid rental price.");
  }

  return amount;
};

export const getPaymentDescription = (payment: {
  product?: string;
  adTitle?: string;
}) => {
  if (payment.product !== RENTAL_PRODUCT) {
    return SELLER_PRODUCT_NAME;
  }

  return payment.adTitle
    ? `${RENTAL_PRODUCT_NAME} · ${payment.adTitle}`
    : RENTAL_PRODUCT_NAME;
};
