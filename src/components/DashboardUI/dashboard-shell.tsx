import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import AppSidebar from "./app-sidebar";
import { DashboardProvider } from "./dashboard-context";
import DashboardTopbar from "./dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

const DashboardShell = async ({ children }: DashboardShellProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const role = session.user.role?.toLowerCase() || "buyer";
  const userName = session.user.name || "User";
  const userEmail = session.user.email;

  return (
    <DashboardProvider value={{ role, userName, userEmail }}>
      <SidebarProvider
        defaultOpen
        className="!min-h-0 flex-1 bg-background"
      >
        <AppSidebar role={role} />

        <SidebarInset className="min-w-0 overflow-hidden bg-muted/20">
          <DashboardTopbar role={role} />

          <div className="dashboard-scroll-area flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
};

export default DashboardShell;
