export const pageTitles: Record<string, string> = {
  "ads-approval": "Ads Approval",
  "manage-ads": "Manage Ads",
  "manage-users": "Manage Users",
  "my-ads": "My Ads",
  "my-bookings": "My Bookings",
  "my-favorites": "My Favorites",
  "my-profile": "My Profile",
  "payment-history": "Payment History",
  "payment-management": "Payment Management",
  settings: "Settings",
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const getDashboardPageTitle = (role: string, pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "dashboard";

  if (pathname === `/dashboard/${role}`) {
    return "Dashboard";
  }

  return (
    pageTitles[lastSegment] ??
    lastSegment
      .split("-")
      .map((part) => capitalize(part))
      .join(" ")
  );
};
