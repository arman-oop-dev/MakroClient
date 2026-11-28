import { requireDashboardRole } from "@/lib/dashboard-access";

const BuyerDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requireDashboardRole("buyer");
  return children;
};

export default BuyerDashboardLayout;
