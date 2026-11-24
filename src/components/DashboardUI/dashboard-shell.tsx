import { Suspense } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import DashboardShellContent from "./dashboard-shell-content";
import DashboardShellSidebar from "./dashboard-shell-sidebar";
import DashboardTopbar from "./dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

const DashboardShell = ({ children }: DashboardShellProps) => {
  return (
    <SidebarProvider defaultOpen className="!min-h-0 flex-1 bg-background">
      <Suspense
        fallback={
          <aside className="sticky top-[3.5625rem] hidden h-[calc(100svh-3.5625rem)] w-64 shrink-0 self-start border-r border-border/70 bg-sidebar md:block" />
        }
      >
        <DashboardShellSidebar />
      </Suspense>

      <SidebarInset className="min-w-0 overflow-hidden bg-muted/20">
        <DashboardTopbar />

        <div className="dashboard-scroll-area flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="h-52 w-full rounded-2xl bg-muted/40" />}>
              <DashboardShellContent>{children}</DashboardShellContent>
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardShell;
