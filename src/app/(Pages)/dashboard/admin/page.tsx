import { Suspense } from "react";

import AdminPaymentSummary from "@/components/DashboardUI/Admin/AdminPaymentSummary";
import DashboardOverview from "@/components/DashboardUI/dashboard-overview";

const Page = () => {
  return (
    <div className="space-y-6">
      <DashboardOverview />

      <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted/40" />}>
        <AdminPaymentSummary />
      </Suspense>
    </div>
  );
};

export default Page;
