"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  Pencil,
  RefreshCw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { useLoginSession } from "@/lib/API/Session/UseLoginSession";

type AdStatus = "pending" | "approved" | "rejected";

type Ad = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  rentType?: "hour" | "day" | "week" | "month";
  image: string;
  status: AdStatus;
  createdAt?: string;
  updatedAt?: string;
};

const statusConfig: Record<
  AdStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  approved: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    icon: Clock3,
  },
  rejected: {
    label: "Rejected",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    icon: XCircle,
  },
};

const rentTypeLabels: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const StatusBadge = ({ status }: { status: AdStatus }) => {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("h-6 gap-1 px-2", config.className)}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </Badge>
  );
};

const TableSkeleton = () => (
  <Table>
    <TableHeader className="bg-muted/40">
      <TableRow>
        <TableHead className="pl-4">Image</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Posted</TableHead>
        <TableHead className="pr-4 text-right">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell className="pl-4">
            <Skeleton className="size-14 rounded-lg" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="mt-2 h-3 w-64" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-4xl" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="pr-4 text-right">
            <Skeleton className="ml-auto size-7" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const AllAds = () => {
  const { user, isPending } = useLoginSession();
  const sellerID = user?.id;

  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const fetchAds = useCallback(
    async (signal?: AbortSignal) => {
      if (!sellerID) return;

      try {
        const { data: tokenData, error: tokenError } = await authClient.token();
        setIsLoading(true);
        setError("");

        if (tokenError || !tokenData?.token) {
          throw new Error("Unauthorized. Please log in again.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${sellerID}/ads`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
            signal,
          },
        );

        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.message || "Failed to load your ads.");
        }
        if (!Array.isArray(result?.data)) {
          throw new Error("Unexpected response from the server.");
        }

        setAds(result.data as Ad[]);
      } catch (caught) {
        if (signal?.aborted) return;
        setAds([]);
        setError(
          caught instanceof Error ? caught.message : "Failed to load your ads.",
        );
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [sellerID],
  );

  useEffect(() => {
    if (!sellerID) return;

    const controller = new AbortController();
    // State updates happen after the network call resolves, not synchronously
    // in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAds(controller.signal);
    return () => controller.abort();
  }, [sellerID, fetchAds, reloadKey]);

  if (!isPending && !sellerID) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
        <AlertCircle className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Sign in to see your ads
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your listings will appear here once you are signed in as a seller.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              All ads
            </h2>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Refresh ads"
            title="Refresh ads"
            disabled={isLoading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw
              className={cn("size-4", isLoading && "animate-spin")}
              aria-hidden="true"
            />
          </Button>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-6 text-destructive" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Could not load your ads
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
        ) : isPending || (sellerID && isLoading) ? (
          <TableSkeleton />
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              No ads yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Use the Create Ads button above to publish your first rental ad.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-24 pl-4">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell className="pl-4">
                    <div className="relative size-14 overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={ad.image}
                        alt={`${ad.title} preview`}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72">
                    <p className="truncate font-medium text-foreground">
                      {ad.title}
                    </p>
                    {ad.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {ad.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      ৳{formatPrice(ad.price)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      / {rentTypeLabels[ad.rentType ?? "day"] ?? "day"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ad.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(ad.createdAt)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${ad.title}`}
                      title="Edit"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
};

export default AllAds;
