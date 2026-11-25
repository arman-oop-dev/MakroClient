export const SELLER_PRODUCT_NAME = "Markro Selling Pro Account";
export const SELLER_PRICE_CENTS = 2000;

export const formatUsd = (amountInCents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);

export const formatUsdPrice = (amountInDollars: number) =>
  formatUsd(Math.round(Number(amountInDollars) * 100));

export const formatPaymentDate = (value: string | Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatStripeSessionId = (value: string) =>
  value.length > 22
    ? `${value.slice(0, 14)}…${value.slice(-8)}`
    : value;
