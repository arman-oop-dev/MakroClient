"use client";

import { cn } from "cn";
import {
  AlertCircle,
  Check,
  Crown,
  Inbox,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type UserRole, USER_ROLES } from "@/lib/roles";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  createdAt?: string;
  emailVerified: boolean;
};

type RoleConfig = {
  label: string;
  icon: LucideIcon;
  badge: string;
  avatar: string;
  active: string;
};

const roleConfig: Record<UserRole, RoleConfig> = {
  buyer: {
    label: "Buyer",
    icon: UserRound,
    badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    avatar: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    active: "bg-sky-500/15 text-sky-700 shadow-sm dark:text-sky-300",
  },
  seller: {
    label: "Seller",
    icon: Store,
    badge:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    avatar:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    active: "bg-emerald-500/15 text-emerald-700 shadow-sm dark:text-emerald-300",
  },
  admin: {
    label: "Admin",
    icon: Crown,
    badge:
      "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    avatar:
      "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    active: "bg-violet-500/15 text-violet-700 shadow-sm dark:text-violet-300",
  },
};

const roleFilters: Array<"all" | UserRole> = ["all", ...USER_ROLES];

const formatJoined = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) => (
  <div className="rounded-2xl border bg-card p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
      </div>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl border",
          tone,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>
    </div>
  </div>
);

const TableSkeleton = () => (
  <Table>
    <TableHeader className="bg-muted/40">
      <TableRow>
        <TableHead className="pl-5">User</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Joined</TableHead>
        <TableHead className="pr-5 text-right">Change role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell className="pl-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-44" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="pr-5">
            <Skeleton className="ml-auto h-8 w-56 rounded-lg" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ManageUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/users", { signal });
      const result = await response.json().catch(() => null);

      if (!response.ok || !Array.isArray(result?.users)) {
        throw new Error(result?.error || "Failed to load users.");
      }

      setUsers(result.users as AdminUser[]);
      setCurrentUserId(String(result.currentUserId ?? ""));
    } catch (caught) {
      if (signal?.aborted) return;

      setUsers([]);
      setError(
        caught instanceof Error ? caught.message : "Failed to load users.",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers(controller.signal);

    return () => controller.abort();
  }, [loadUsers, reloadKey]);

  const changeRole = useCallback(
    async (target: AdminUser, role: UserRole) => {
      if (target.role === role || updatingId) return;

      const previousUsers = users;
      setUpdatingId(target.id);
      setUsers((current) =>
        current.map((user) =>
          user.id === target.id ? { ...user, role } : user,
        ),
      );

      try {
        const response = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: target.id, role }),
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Failed to update the role.");
        }

        setUsers((current) =>
          current.map((user) =>
            user.id === target.id ? (result.user as AdminUser) : user,
          ),
        );
        toast.success(`${target.name} is now ${roleConfig[role].label}`);
      } catch (caught) {
        setUsers(previousUsers);
        toast.error(
          caught instanceof Error
            ? caught.message
            : "Failed to update the role.",
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [updatingId, users],
  );

  const counts = useMemo(
    () => ({
      all: users.length,
      buyer: users.filter((user) => user.role === "buyer").length,
      seller: users.filter((user) => user.role === "seller").length,
      admin: users.filter((user) => user.role === "admin").length,
    }),
    [users],
  );

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${user.name} ${user.email}`.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm sm:p-7">
        <div
          className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Admin controls
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Manage users
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              View every account and assign buyer, seller, or admin access.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw
              className={cn("size-4", isLoading && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={counts.all}
          icon={Users}
          tone="border-primary/20 bg-primary/10 text-primary"
        />
        <StatCard
          label="Buyers"
          value={counts.buyer}
          icon={UserRound}
          tone="border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300"
        />
        <StatCard
          label="Sellers"
          value={counts.seller}
          icon={Store}
          tone="border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
        />
        <StatCard
          label="Admins"
          value={counts.admin}
          icon={Crown}
          tone="border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              All accounts
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Role changes take effect on the user&apos;s next session refresh.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="h-9 pl-9"
                aria-label="Search users"
              />
            </div>

            <div className="inline-flex w-fit rounded-lg border bg-muted/30 p-0.5">
              {roleFilters.map((filter) => {
                const isActive = roleFilter === filter;
                const label =
                  filter === "all"
                    ? "All"
                    : roleConfig[filter].label;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRoleFilter(filter)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-6 text-destructive" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Could not load users
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <TableSkeleton />
        ) : visibleUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              No users found
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try another search term or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-5">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-5 text-right">Change role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.map((user) => {
                  const config = roleConfig[user.role];
                  const RoleIcon = config.icon;
                  const isSelf = user.id === currentUserId;
                  const isUpdating = updatingId === user.id;

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold",
                              config.avatar,
                            )}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-foreground">
                                {user.name}
                              </p>
                              {isSelf && (
                                <Badge variant="outline" className="h-5 px-1.5">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", config.badge)}
                        >
                          <RoleIcon className="size-3" aria-hidden="true" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatJoined(user.createdAt)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <div
                          className="inline-flex w-fit items-center rounded-lg border bg-muted/30 p-0.5"
                          aria-label={`Change role for ${user.name}`}
                        >
                          {USER_ROLES.map((role) => {
                            const isActive = user.role === role;

                            return (
                              <button
                                key={role}
                                type="button"
                                disabled={isSelf || isUpdating}
                                aria-pressed={isActive}
                                onClick={() => void changeRole(user, role)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
                                  isActive
                                    ? roleConfig[role].active
                                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                                )}
                              >
                                {isActive && (
                                  <Check className="size-3" aria-hidden="true" />
                                )}
                                {roleConfig[role].label}
                              </button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageUsers;
