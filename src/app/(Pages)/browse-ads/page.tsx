import { AlertCircle, Inbox } from "lucide-react";
import { Suspense } from "react";

import ProductCard, { type BrowseAd } from "@/components/BrowseUI/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Browse Ads | Markro",
  description: "Explore approved rental ads from sellers across Markro.",
};

const getAds = async (): Promise<BrowseAd[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load ads.");
  }

  const result = await response.json();
  if (!result?.success || !Array.isArray(result?.data)) {
    return [];
  }

  return result.data as BrowseAd[];
};

const AdsGridSkeleton = () => (
  <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <Card key={index} className="gap-0 overflow-hidden py-0">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <CardContent className="px-5 pt-5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-3 h-3 w-1/2" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-6 h-8 w-1/2" />
        </CardContent>
        <CardContent className="pb-5">
          <Skeleton className="h-9 w-full rounded-lg" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const AdsGrid = async () => {
  let ads: BrowseAd[] = [];
  let loadError = "";

  try {
    ads = await getAds();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load ads.";
  }

  if (loadError) {
    return (
      <Card className="mt-10 border-dashed bg-card/50">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">
            Could not load ads
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
        </CardContent>
      </Card>
    );
  }

  if (ads.length === 0) {
    return (
      <Card className="mt-10 border-dashed bg-card/50">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">
            No ads available yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved listings will appear here as soon as they are ready.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ads.map((ad) => (
        <ProductCard key={ad._id} ad={ad} />
      ))}
    </div>
  );
};

const BrowseAds = () => {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Browse listings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Find the right gear for your next project
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Explore approved rental ads from sellers across Bangladesh and
            connect directly with the owner.
          </p>
        </header>

        <Suspense fallback={<AdsGridSkeleton />}>
          <AdsGrid />
        </Suspense>
      </div>
    </main>
  );
};

export default BrowseAds;
