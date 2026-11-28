import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Camera,
  Clock,
  Construction,
  Laptop,
  LockKeyhole,
  PartyPopper,
  Search,
  ShieldCheck,
  Tractor,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import ProductCard, { type BrowseAd } from "@/components/BrowseUI/ProductCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAds } from "@/lib/ads";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  inverted?: boolean;
}

const SectionHeading = ({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  inverted = false,
}: SectionHeadingProps) => (
  <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
          inverted
            ? "bg-white/10 text-cyan-200 ring-1 ring-white/15"
            : "bg-primary/10 text-primary",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            inverted ? "bg-cyan-300" : "bg-primary",
          )}
        />
        {eyebrow}
      </span>

      <h2
        className={cn(
          "mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "mt-3 text-sm leading-6 sm:text-base",
            inverted ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>

    {href && linkLabel && (
      <Link
        href={href}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
          inverted
            ? "border border-white/20 text-white hover:bg-white/10"
            : "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
        )}
      >
        {linkLabel}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    )}
  </div>
);

const EmptyState = () => (
  <Card className="rounded-3xl border-dashed bg-card/50">
    <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
      No equipment available right now. Check back soon.
    </CardContent>
  </Card>
);

const AdGrid = ({ ads }: { ads: BrowseAd[] }) => {
  if (!ads.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
      {ads.map((ad) => (
        <ProductCard key={ad._id} ad={ad} />
      ))}
    </div>
  );
};

export const HomeSectionSkeleton = () => (
  <section className="py-20 sm:py-24">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-6 w-40 rounded-full" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full rounded-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="gap-0 overflow-hidden rounded-2xl py-0">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <CardContent className="px-4 py-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-3 h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export const WhyChooseUsSkeleton = () => (
  <section className="bg-[#052e3b] py-20 sm:py-24">
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="h-80 rounded-[2.25rem] bg-white/5" />
      <div>
        <div className="h-6 w-40 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-80 max-w-full rounded-xl bg-white/10" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const FeaturedProducts = async () => {
  const ads = await getAds("?limit=6&sort=price");

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,rgba(0,151,178,0.14),transparent_65%)]" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our fleet"
          title="Feature Products"
          description="Great-value equipment, ready to book for your next project."
          href="/browse-ads"
          linkLabel="View all equipment"
        />
        <AdGrid ads={ads} />
      </div>
    </section>
  );
};

interface CategoryItem {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

const categories: CategoryItem[] = [
  {
    label: "Construction Equipment",
    value: "construction",
    description: "Tools and machines for every jobsite.",
    icon: Construction,
  },
  {
    label: "Photography Equipment",
    value: "photography",
    description: "Cameras, lighting, and studio gear.",
    icon: Camera,
  },
  {
    label: "Vehicles & Transportation",
    value: "vehicles",
    description: "Reliable rides and transport options.",
    icon: Truck,
  },
  {
    label: "Agriculture Equipment",
    value: "agriculture",
    description: "Farm tools and machinery on demand.",
    icon: Tractor,
  },
  {
    label: "Electronics",
    value: "electronics",
    description: "Audio, computing, and smart devices.",
    icon: Laptop,
  },
  {
    label: "Event Equipment",
    value: "event",
    description: "Everything you need to host an event.",
    icon: PartyPopper,
  },
];

export const CategoriesSection = () => (
  <section
    id="categories"
    className="border-y border-border/70 bg-muted/40 py-20 sm:py-24"
  >
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Our services"
        title="Popular equipment categories"
        description="Find the right gear quickly by browsing the categories renters use most."
        href="/browse-ads"
        linkLabel="Browse by category"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ label, value, description, icon: Icon }, index) => (
          <Link
            key={value}
            href={`/browse-ads?category=${value}`}
            className="group block h-full rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Card className="relative h-full gap-0 overflow-hidden rounded-3xl border-border/70 bg-card/80 py-0 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl">
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,151,178,0),rgba(0,151,178,0.12))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative flex h-full flex-col px-6 py-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 transition duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle className="mt-6 text-base font-semibold text-foreground">
                  {label}
                </CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-semibold text-primary">
                  Explore equipment
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  {
    title: "Browse & compare",
    description:
      "Filter by category, city, and rental period to find the right equipment fast.",
    icon: Search,
  },
  {
    title: "Book with confidence",
    description:
      "Review clear pricing and book approved listings from verified owners.",
    icon: ShieldCheck,
  },
  {
    title: "Pick up & get to work",
    description:
      "Arrange pickup, use the gear, and return it when your job is done.",
    icon: Truck,
  },
];

export const HowItWorks = () => (
  <section className="py-20 sm:py-24">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="Rent in three simple steps"
        description="A smooth rental flow from search to pickup, designed to save you time."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }, index) => (
          <div
            key={title}
            className="relative rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
              0{index + 1}
            </span>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

interface BenefitItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: BenefitItem[] = [
  {
    title: "Affordable rental prices",
    description:
      "Pay only for what you need with clear, competitive daily and weekly rates.",
    icon: BadgeDollarSign,
  },
  {
    title: "Verified equipment owners",
    description:
      "Browse listings from approved local owners and renters you can trust.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible rental periods",
    description:
      "Choose hourly, daily, or weekly rentals that fit your schedule and budget.",
    icon: Clock,
  },
  {
    title: "Secure payments",
    description:
      "Simple protected checkout keeps your booking and payment information safe.",
    icon: LockKeyhole,
  },
];

export const WhyChooseUs = async () => {
  const ads = await getAds("?limit=1&sort=price");
  const visualAd = ads[0];

  return (
    <section className="relative isolate overflow-hidden bg-[#052e3b] py-20 sm:py-24">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#052e3b_0%,#073b4c_55%,#0a5c70_100%)]" />
      <div className="absolute -left-24 top-10 -z-10 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-24 -bottom-20 -z-10 size-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/10 sm:aspect-[16/9]">
            {visualAd && (
              <Image
                src={visualAd.image}
                alt={`${visualAd.title} preview`}
                fill
                unoptimized
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div>
          <SectionHeading
            inverted
            eyebrow="Why Markro"
            title="Why Choose Us"
            description="Unmatched value, dependable equipment, and a rental experience built around your schedule."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl transition hover:bg-white/15"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-white/65">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const RecentlyAdded = async () => {
  const ads = await getAds("?limit=6");

  return (
    <section className="bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Latest listings"
          title="Recently Added Equipment"
          description="The newest approved equipment listed by owners across Markro."
          href="/browse-ads"
          linkLabel="See more equipment"
        />
        <AdGrid ads={ads} />
      </div>
    </section>
  );
};

export const CallToAction = () => (
  <section className="px-4 py-16 sm:py-20">
    <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#052e3b] px-6 py-14 text-center text-white sm:px-12">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#052e3b_0%,#0a5c70_100%)]" />
      <div className="absolute -top-24 left-1/3 -z-10 size-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-16 -bottom-20 -z-10 size-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200 uppercase">
        Start renting today
      </span>
      <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
        Ready to get the job done?
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
        Browse approved equipment, compare transparent prices, and book in
        minutes.
      </p>
      <Link
        href="/browse-ads"
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        Explore equipment
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  </section>
);
