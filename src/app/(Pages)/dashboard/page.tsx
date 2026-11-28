import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";

const DashboardRedirectPage = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect("/?signIn=1&redirectTo=%2Fdashboard");
  }

  const role = String(session.user.role ?? "").toLowerCase();
  const dashboard =
    role === "admin" || role === "seller" ? role : "buyer";

  redirect(`/dashboard/${dashboard}`);
};

export default DashboardRedirectPage;
