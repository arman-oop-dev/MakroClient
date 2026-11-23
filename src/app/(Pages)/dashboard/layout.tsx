import { Suspense } from "react";

import DashboardShell from "@/components/DashboardUI/dashboard-shell";
import DashboardShellSkeleton from "@/components/DashboardUI/dashboard-shell-skeleton";

const DashboardSidebarLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
};

export default DashboardSidebarLayout;
