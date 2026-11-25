import { Suspense } from "react";

import HeroBanner from "@/components/HomeUI/HeroBanner";
import {
  CallToAction,
  CategoriesSection,
  FeaturedProducts,
  HomeSectionSkeleton,
  HowItWorks,
  RecentlyAdded,
  WhyChooseUs,
  WhyChooseUsSkeleton,
} from "@/components/HomeUI/HomeSections";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroBanner />
      <CategoriesSection />
      <Suspense fallback={<HomeSectionSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <HowItWorks />
      <Suspense fallback={<WhyChooseUsSkeleton />}>
        <WhyChooseUs />
      </Suspense>
      <Suspense fallback={<HomeSectionSkeleton />}>
        <RecentlyAdded />
      </Suspense>
      <CallToAction />
    </main>
  );
}
