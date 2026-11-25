import { ChevronRight, MapPin, Package, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";

import FavoriteButton from "@/components/BrowseUI/FavoriteButton";
import { type BrowseAd } from "@/components/BrowseUI/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";

const categoryLabels: Record<string, string> = {
  construction: "Construction",
  photography: "Photography",
  vehicles: "Vehicles & Transportation",
  agriculture: "Agriculture",
  electronics: "Electronics",
  event: "Event",
  others: "Others",
};

const rentTypeLabels: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(value);

const getSellerName = (sellerID: BrowseAd["sellerID"]) =>
  typeof sellerID === "object" && sellerID?.name?.trim()
    ? sellerID.name.trim()
    : "Markro seller";

const BreadcrumbSkeleton = () => (
  <div className="mb-6 flex items-center gap-2">
    <Skeleton className="h-4 w-14" />
    <Skeleton className="size-3" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="size-3" />
    <Skeleton className="h-4 w-24" />
  </div>
);

const DetailsSkeleton = () => (
  <div>
    <BreadcrumbSkeleton />
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="grid gap-8 px-4 py-5 sm:px-6 md:grid-cols-2 md:gap-12 lg:px-10 lg:py-8">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]" />
        <div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-6 h-9 w-40" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const AdDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`, {
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  const ads = Array.isArray(result?.data) ? (result.data as BrowseAd[]) : [];
  const ad = ads.find((item) => item._id === id);

  if (!ad) notFound();

  const rentLabel = rentTypeLabels[ad.rentType ?? "day"] ?? "day";
  const categoryLabel = categoryLabels[ad.category ?? "others"] ?? "Others";
  const locationLabel = [ad.city, ad.location].filter(Boolean).join(" · ");
  const sellerName = getSellerName(ad.sellerID);

  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link
          href="/"
          className="transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          Home
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link
          href="/browse-ads"
          className="transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          Browse Ads
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link
          href={`/browse-ads?category=${ad.category ?? "others"}`}
          className="transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          {categoryLabel}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span
          aria-current="page"
          className="max-w-[16rem] truncate text-foreground"
        >
          {ad.title}
        </span>
      </nav>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="grid gap-8 px-4 py-5 sm:px-6 md:grid-cols-2 md:gap-12 lg:px-10 lg:py-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted sm:aspect-[16/10]">
            <Image
              src={ad.image}
              alt={`${ad.title} preview`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 border-0 bg-white/90 text-foreground shadow-sm backdrop-blur-sm"
            >
              {categoryLabel}
            </Badge>
            <FavoriteButton />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
              {ad.title}
            </h1>

            <p className="mt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Category: {categoryLabel}
            </p>

            {locationLabel && (
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {locationLabel}
              </p>
            )}

            <p className="mt-6 text-3xl font-semibold text-primary">
              {formatPrice(ad.price)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /{rentLabel}
              </span>
            </p>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="size-4 text-primary" aria-hidden="true" />
              {ad.quantity ?? 1} available
            </p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">
                Description
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {ad.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 flex min-w-0 items-center gap-2 rounded-2xl bg-[#f1f5f6] px-4 py-3 text-sm">
              <UserRound className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate text-foreground">
                <span className="font-medium">Rent By:</span> {sellerName}
              </span>
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-6 w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Rent
              <span className="ml-1 font-semibold">
                {formatPrice(ad.price)}/{rentLabel}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AuthenticatedAdDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  return <AdDetails params={params} />;
};

const AdDetailsPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Suspense fallback={<DetailsSkeleton />}>
          <AuthenticatedAdDetails params={params} />
        </Suspense>
      </div>
    </main>
  );
};

export default AdDetailsPage;
