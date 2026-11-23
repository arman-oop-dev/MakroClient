"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type DashboardMenuGroup = {
  label: string;
  items: {
    name: string;
    url: string;
    icon: ReactNode;
    badge?: string;
  }[];
};

const SidebarNavigation = ({ groups }: { groups: DashboardMenuGroup[] }) => {
  const pathname = usePathname();

  const activeUrl = groups
    .flatMap((group) => group.items)
    .reduce((current, item) => {
      const isMatch =
        pathname === item.url || pathname.startsWith(`${item.url}/`);

      return isMatch && item.url.length > current.length ? item.url : current;
    }, "");

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label} className="py-1">
          <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
            {group.label}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = activeUrl === item.url;
                const activeStyle = isActive
                  ? {
                      backgroundColor: "var(--sidebar-accent)",
                      color: "var(--sidebar-accent-foreground)",
                      fontWeight: 600,
                    }
                  : undefined;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={item.url}
                          aria-current={isActive ? "page" : undefined}
                        />
                      }
                      isActive={isActive}
                      tooltip={item.name}
                      style={activeStyle}
                      className={`h-9 gap-3 rounded-lg px-2.5 font-medium ${item.badge ? "pr-10" : ""}`}
                    >
                      <span className="text-inherit [&_svg]:size-4">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </SidebarMenuButton>

                    {item.badge ? (
                      <SidebarMenuBadge className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};

export default SidebarNavigation;
