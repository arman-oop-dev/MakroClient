import { requireDashboardRole } from "@/lib/dashboard-access";

const SellerDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requireDashboardRole("seller");
  return children;
};

export default SellerDashboardLayout;
