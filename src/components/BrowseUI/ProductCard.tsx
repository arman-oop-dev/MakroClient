import { MapPin } from "lucide-react";
import Image from "next/image";

import AuthProductLink from "@/components/BrowseUI/AuthProductLink";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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
  sellerID?: { _id: string; name?: string; email?: string; image?: string } | string | null;
  status?: string;
  terms_condition?: string;
  createdAt?: string;
};

const rentTypeLabels: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(value);

interface ProductCardProps {
  ad: BrowseAd;
}
const ProductCard = ({ ad }: ProductCardProps) => {
  const rentLabel = rentTypeLabels[ad.rentType ?? "day"] ?? "day";
  const locationLabel = [ad.city, ad.location].filter(Boolean).join(" · ");

  return (
    <AuthProductLink
      href={`/ads/${ad._id}`}
      className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      ariaLabel={`View details for ${ad.title}`}
    >
      <Card className="group/card h-full gap-0 overflow-hidden py-0 transition duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={ad.image}
            alt={`${ad.title} preview`}
            fill
            unoptimized
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover/card:scale-105"
          />
        </div>

        <CardContent className="px-3.5 py-3.5 sm:px-4 sm:py-4">
          <p className="truncate text-sm text-primary font-bold">
            {formatPrice(ad.price)}/{rentLabel}
          </p>

          <CardTitle className="mt-1.5 line-clamp-1 text-sm font-medium tracking-tight">
            {ad.title}
          </CardTitle>

          {locationLabel && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationLabel}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </AuthProductLink>
  );
};

export default ProductCard;
