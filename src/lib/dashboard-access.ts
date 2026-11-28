import "server-only";

import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";

type DashboardRole = "admin" | "buyer" | "seller";

const normalizeRole = (value: unknown): DashboardRole => {
  const role = typeof value === "string" ? value.toLowerCase() : "";
  return role === "admin" || role === "seller" ? role : "buyer";
};

export async function requireDashboardRole(expected: DashboardRole) {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(`/?signIn=1&redirectTo=%2Fdashboard%2F${expected}`);
  }

  const role = normalizeRole(session.user.role);

  if (role !== expected) {
    redirect(`/dashboard/${role}`);
  }

  return session;
}
