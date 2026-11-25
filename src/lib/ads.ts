import "server-only";

import type { BrowseAd } from "@/components/BrowseUI/ProductCard";

export async function getApprovedAdById(
  adId: string,
): Promise<BrowseAd | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing from environment variables");
  }

  const response = await fetch(`${apiUrl}/ads`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load rental ads right now.");
  }

  const result = await response.json().catch(() => null);
  const ads = Array.isArray(result?.data) ? (result.data as BrowseAd[]) : [];

  return (
    ads.find((ad) => ad._id === adId && ad.status === "approved") ?? null
  );
}
