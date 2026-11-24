"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";

import { getDashboardPageTitle } from "./dashboard-page-title";

const getRoleFromPathname = (pathname: string) => {
  const segment = pathname.split("/")[2]?.toLowerCase();
  if (segment === "admin" || segment === "buyer" || segment === "seller") {
    return segment;
  }
  return "buyer";
};

const DashboardTopbar = () => {
  const pathname = usePathname();
  const role = getRoleFromPathname(pathname);
  const title = getDashboardPageTitle(role, pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <SidebarTrigger className="shrink-0" />

      <div className="min-w-0 flex-1">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:flex"
        >
          <Link
            href={`/dashboard/${role}`}
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span className="truncate text-foreground">{title}</span>
        </nav>
        <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default DashboardTopbar;
