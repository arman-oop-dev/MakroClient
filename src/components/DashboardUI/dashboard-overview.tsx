"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { useDashboard } from "./dashboard-context";

type OverviewConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
};

const overviewByRole: Record<string, OverviewConfig> = {
  admin: {
    eyebrow: "Admin console",
    title: "Good to see you",
    description:
      "Here is what is happening across Markro today. Stay on top of users, ads, approvals, and payments from one place.",
    primaryAction: {
      label: "Review pending ads",
      href: "/dashboard/admin/manage-ads",
    },
    secondaryAction: {
      label: "Manage users",
      href: "/dashboard/admin/manage-users",
    },
  },
  buyer: {
    eyebrow: "Buyer dashboard",
    title: "Welcome back",
    description:
      "Keep track of the ads you love, your bookings, and every payment in one calm, easy-to-scan place.",
    primaryAction: {
      label: "Browse ads",
      href: "/browse-ads",
    },
    secondaryAction: {
      label: "My bookings",
      href: "/dashboard/buyer/my-bookings",
    },
  },
  seller: {
    eyebrow: "Seller dashboard",
    title: "Good to see you",
    description:
      "Your ads are getting attention. Review performance, manage listings, and follow every payment from here.",
    primaryAction: {
      label: "Manage my ads",
      href: "/dashboard/seller/my-ads",
    },
    secondaryAction: {
      label: "Payment history",
      href: "/dashboard/seller/payment-history",
    },
  },
};

const DashboardOverview = () => {
  const { role, userName } = useDashboard();
  const normalizedRole = role.toLowerCase();
  const config = overviewByRole[normalizedRole] ?? overviewByRole.buyer;
  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-accent to-primary p-6 text-white shadow-sm sm:p-8">
      <div
        className="absolute -top-20 -right-16 size-64 rounded-full bg-primary/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
            {config.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {config.title}, {firstName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {config.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={config.primaryAction.href}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-accent shadow-sm transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent focus-visible:outline-none"
          >
            {config.primaryAction.label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={config.secondaryAction.href}
            className="inline-flex h-10 items-center rounded-lg border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent focus-visible:outline-none"
          >
            {config.secondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;
