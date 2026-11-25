import { Suspense } from "react";

import PaymentHistory from "@/components/DashboardUI/Seller/PaymentHistory";

const Page = () => {
  return (
    <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted/40" />}>
      <PaymentHistory />
    </Suspense>
  );
};

export default Page;
