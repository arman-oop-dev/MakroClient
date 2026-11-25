import { ArrowLeft, CalendarDays, MapPin, Package } from "lucide-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";

import { type BrowseAd } from "@/components/BrowseUI/ProductCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";

const categoryLabels: Record<string, string> = {
  construction: "Construction",
  photography: "Photography",
  vehicles: "Vehicles",
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

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const DetailsSkeleton = () => (
  <Card className="gap-0 overflow-hidden py-0">
    <Skeleton className="aspect-[16/9] w-full rounded-none sm:aspect-[21/9]" />
    <CardContent className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_18rem] lg:px-10">
      <div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-8 h-4 w-32" />
        <Skeleton className="mt-3 h-4 w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </CardContent>
  </Card>
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

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative aspect-[16/9] bg-muted sm:aspect-[21/9]">
        <Image
          src={ad.image}
          alt={`${ad.title} preview`}
          fill
          unoptimized
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-4 top-4 flex gap-2">
          <Badge
            variant="secondary"
            className="border-0 bg-white/90 text-foreground shadow-sm backdrop-blur-sm"
          >
            {categoryLabel}
          </Badge>
          <Badge className="border-0 bg-emerald-600 text-white shadow-sm">
            Available
          </Badge>
        </div>
      </div>

      <CardContent className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_18rem] lg:px-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {ad.title}
          </h1>

          {locationLabel && (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {locationLabel}
            </p>
          )}

          <div className="mt-7">
            <h2 className="text-sm font-semibold text-foreground">
              Description
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {ad.description || "No description provided."}
            </p>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-semibold text-foreground">
              Terms & conditions
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {ad.terms_condition || "No terms provided."}
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border bg-card/50 p-5 shadow-sm lg:sticky lg:top-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rent per {rentLabel}
          </p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            ৳{formatPrice(ad.price)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              /{rentLabel}
            </span>
          </p>

          <dl className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Package className="size-4" aria-hidden="true" />
                Available quantity
              </dt>
              <dd className="font-medium text-foreground">{ad.quantity ?? 1}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                Posted
              </dt>
              <dd className="font-medium text-foreground">
                {formatDate(ad.createdAt)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-6 w-full justify-center",
            )}
          >
            Contact seller
          </button>
        </aside>
      </CardContent>
    </Card>
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
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/browse-ads"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6")}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to browse
        </Link>

        <Suspense fallback={<DetailsSkeleton />}>
          <AuthenticatedAdDetails params={params} />
        </Suspense>
      </div>
    </main>
  );
};

export default AdDetailsPage;
