import { ArrowUpRight, MapPin, Package } from "lucide-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

export type BrowseAd = {
  _id: string;
  title: string;
  category?: string;
  city?: string;
  location?: string;
  price: number;
  rentType?: string;
  quantity?: number;
  description?: string;
  image: string;
  status?: string;
  terms_condition?: string;
  createdAt?: string;
};

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

const ProductCard = ({ ad }: { ad: BrowseAd }) => {
  const rentLabel = rentTypeLabels[ad.rentType ?? "day"] ?? "day";
  const categoryLabel = categoryLabels[ad.category ?? "others"] ?? "Others";
  const locationLabel = [ad.city, ad.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/ads/${ad._id}`}
      className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label={`View details for ${ad.title}`}
    >
      <Card className="group/card h-full gap-0 overflow-hidden py-0 transition duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={ad.image}
            alt={`${ad.title} preview`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover/card:scale-105"
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
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

        <CardContent className="flex flex-1 flex-col px-5 pt-5">
          <CardTitle className="line-clamp-1 text-lg tracking-tight">
            {ad.title}
          </CardTitle>

          {locationLabel && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationLabel}</span>
            </p>
          )}

          <CardDescription className="mt-3 line-clamp-2 min-h-10">
            {ad.description || "No description provided."}
          </CardDescription>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Rent per {rentLabel}
              </p>
              <p className="mt-0.5 truncate text-lg font-semibold text-foreground">
                ৳{formatPrice(ad.price)}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                  /{rentLabel}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
              <Package className="size-3.5" aria-hidden="true" />
              {ad.quantity ?? 1}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 pb-5">
          <span
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full justify-center",
            )}
          >
            View details
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
