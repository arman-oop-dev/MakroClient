import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";

import AppSidebar from "./app-sidebar";

const DashboardShellSidebar = async () => {
  const session = await getDashboardSession();

  if (!session) {
    redirect("/");
  }

  const role = session.user.role?.toLowerCase() || "buyer";

  return <AppSidebar role={role} />;
};

export default DashboardShellSidebar;
