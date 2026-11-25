import { Suspense } from "react";

import PaymentManagement from "@/components/DashboardUI/Admin/PaymentManagement";

const Page = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Payment Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review all payments received from sellers and renters.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 w-full rounded-2xl bg-muted/40" />}>
        <PaymentManagement />
      </Suspense>
    </section>
  );
};

export default Page;
