import { requireDashboardRole } from "@/lib/dashboard-access";

const AdminDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await requireDashboardRole("admin");
  return children;
};

export default AdminDashboardLayout;
