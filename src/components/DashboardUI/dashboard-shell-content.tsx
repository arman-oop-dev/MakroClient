import { redirect } from "next/navigation";

import { getDashboardSession } from "@/lib/API/Session/GetDashboardSession";

import { DashboardProvider } from "./dashboard-context";

type DashboardShellContentProps = {
  children: React.ReactNode;
};

const DashboardShellContent = async ({
  children,
}: DashboardShellContentProps) => {
  const session = await getDashboardSession();

  if (!session) {
    redirect("/");
  }

  const role = session.user.role?.toLowerCase() || "buyer";
  const userName = session.user.name || "User";
  const userEmail = session.user.email;

  return (
    <DashboardProvider value={{ role, userName, userEmail }}>
      {children}
    </DashboardProvider>
  );
};

export default DashboardShellContent;
