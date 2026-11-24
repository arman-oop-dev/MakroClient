import {
  CalendarCheck,
  CircleCheck,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

import SidebarNavigation, {
  type DashboardMenuGroup,
} from "./sidebar-navigation";

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  group: string;
  badge?: string;
};

type AppSidebarProps = {
  role: string;
};

export const menuItemByRole: Record<string, MenuItem[]> = {
  admin: [
    {
      name: "Dashboard",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
      group: "Overview",
    },
    {
      name: "Manage Users",
      url: "/dashboard/admin/manage-users",
      icon: Users,
      group: "Management",
    },
    {
      name: "Manage Ads",
      url: "/dashboard/admin/manage-ads",
      icon: Megaphone,
      group: "Management",
    },
    {
      name: "Ads Approval",
      url: "/dashboard/admin/ads-approval",
      icon: CircleCheck,
      group: "Management",
      badge: "3",
    },
    {
      name: "Payment Management",
      url: "/dashboard/admin/payment-management",
      icon: CreditCard,
      group: "Management",
    },
  ],
  buyer: [
    {
      name: "Dashboard",
      url: "/dashboard/buyer",
      icon: LayoutDashboard,
      group: "Overview",
    },
    {
      name: "My Bookings",
      url: "/dashboard/buyer/my-bookings",
      icon: CalendarCheck,
      group: "My activity",
      badge: "2",
    },
    {
      name: "My Favorites",
      url: "/dashboard/buyer/my-favorites",
      icon: Heart,
      group: "My activity",
    },
    {
      name: "Payment History",
      url: "/dashboard/buyer/payment-history",
      icon: ReceiptText,
      group: "My activity",
    },
  ],
  seller: [
    {
      name: "Dashboard",
      url: "/dashboard/seller",
      icon: LayoutDashboard,
      group: "Overview",
    },
    {
      name: "My Ads",
      url: "/dashboard/seller/my-ads",
      icon: FileText,
      group: "Seller tools",
    },
    {
      name: "Payment History",
      url: "/dashboard/seller/payment-history",
      icon: ReceiptText,
      group: "Seller tools",
    },
  ],
};

const groupOrderByRole: Record<string, string[]> = {
  admin: ["Overview", "Management", "Account"],
  buyer: ["Overview", "My activity", "Account"],
  seller: ["Overview", "Seller tools", "Account"],
};

const AppSidebar = ({ role }: AppSidebarProps) => {
  const normalizedRole = role.toLowerCase();
  const items = menuItemByRole[normalizedRole] ?? menuItemByRole.buyer;
  const groupOrder = groupOrderByRole[normalizedRole] ?? groupOrderByRole.buyer;

  const groups: DashboardMenuGroup[] = groupOrder
    .map((label) => ({
      label,
      items: items
        .filter((item) => item.group === label)
        .map((item) => ({
          name: item.name,
          url: item.url,
          icon: <item.icon aria-hidden="true" />,
          badge: item.badge,
        })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar
      collapsible="icon"
      style={{
        top: "3.5625rem",
        height: "calc(100svh - 3.5625rem)",
        backgroundColor: "#ffffff",
      }}
    >
      <SidebarContent className="px-2 pt-4">
        <div className="rounded-xl border border-sidebar-border/60 bg-white p-1.5 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <SidebarNavigation groups={groups} />
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
