import { AlertCircle, Inbox } from "lucide-react";
import { Suspense } from "react";

import BrowseFilters, {
  type BrowseFilterValues,
} from "@/components/BrowseUI/BrowseFilters";
import MobileFilters from "@/components/BrowseUI/MobileFilters";
import ProductCard, { type BrowseAd } from "@/components/BrowseUI/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAds as getApprovedAds } from "@/lib/ads";

export const metadata = {
  title: "Browse Ads | Markro",
  description: "Explore approved rental ads from sellers across Markro.",
};

type BrowseSearchParams = {
  search?: string | string[];
  category?: string | string[];
  city?: string | string[];
  rentType?: string | string[];
};

type AdsResult = {
  ads: BrowseAd[];
  totalAds: number;
};

const MULTI_FILTER_KEYS = ["category", "city", "rentType"] as const;

const readParam = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
};

const readMultiParam = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(raw.map((item) => item.trim()).filter(Boolean)),
  );
};

const buildAdsQuery = (params: BrowseSearchParams) => {
  const query = new URLSearchParams();
  const search = readParam(params.search);

  if (search) query.set("search", search);

  for (const key of MULTI_FILTER_KEYS) {
    for (const value of readMultiParam(params[key])) {
      query.append(key, value);
    }
  }

  return query.toString();
};

const getAds = async (query = ""): Promise<AdsResult> => {
  const suffix = query ? `?${query}` : "";
  const ads = await getApprovedAds(suffix);

  return { ads, totalAds: ads.length };
};

const uniqueOptions = (values: Array<string | undefined>) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

const ErrorState = ({ message }: { message: string }) => (
  <Card className="border-dashed bg-card/50">
    <CardContent className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        Could not load ads
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </CardContent>
  </Card>
);

const EmptyState = () => (
  <Card className="border-dashed bg-card/50">
    <CardContent className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        No ads found
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try changing or clearing your filters.
      </p>
    </CardContent>
  </Card>
);

const BrowseAdsContent = async ({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) => {
  const resolved = await searchParams;
  const query = buildAdsQuery(resolved);

  const [optionAds, filtered] = await Promise.all([
    getAds().catch(() => ({ ads: [] as BrowseAd[], totalAds: 0 })),
    getAds(query)
      .then((result) => ({ result, error: "" }))
      .catch((error: unknown) => ({
        result: { ads: [] as BrowseAd[], totalAds: 0 },
        error: error instanceof Error ? error.message : "Failed to load ads.",
      })),
  ]);

  const current: BrowseFilterValues = {
    search: readParam(resolved.search),
    category: readMultiParam(resolved.category),
    city: readMultiParam(resolved.city),
    rentType: readMultiParam(resolved.rentType),
  };
  const hasFilters =
    Boolean(current.search) ||
    MULTI_FILTER_KEYS.some((key) => current[key].length > 0);
  const { ads, totalAds } = filtered.result;
  const filterProps = {
    current,
    categories: uniqueOptions(optionAds.ads.map((ad) => ad.category)),
    cities: uniqueOptions(optionAds.ads.map((ad) => ad.city)),
    rentTypes: uniqueOptions(optionAds.ads.map((ad) => ad.rentType)),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <BrowseFilters key={query || "all"} {...filterProps} />
      </aside>

      <section className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {totalAds} {totalAds === 1 ? "ad" : "ads"} found
          </p>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                Showing filtered results
              </p>
            )}
            <MobileFilters key={query || "all"} {...filterProps} />
          </div>
        </div>

        {filtered.error ? (
          <ErrorState message={filtered.error} />
        ) : ads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
            {ads.map((ad) => (
              <ProductCard key={ad._id} ad={ad} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const BrowseAdsSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
    <Card className="gap-0 py-0">
      <CardContent className="space-y-5 px-5 py-5">
        <Skeleton className="h-8 w-24" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>

    <div>
      <Skeleton className="mb-5 h-4 w-24" />
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="gap-0 overflow-hidden py-0">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <CardContent className="px-4 py-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-3 h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const BrowseAdsPage = ({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) => {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <Suspense fallback={<BrowseAdsSkeleton />}>
          <BrowseAdsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
};

export default BrowseAdsPage;
