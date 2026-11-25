import { Suspense } from "react";

import MyBookings from "@/components/DashboardUI/Buyer/MyBookings";

const Page = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          My Bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Rentals confirmed through Stripe.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted/40" />}>
        <MyBookings />
      </Suspense>
    </section>
  );
};

export default Page;
