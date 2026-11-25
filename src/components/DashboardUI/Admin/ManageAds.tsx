"use client";

import { cn } from "cn";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  RefreshCw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useLoginSession } from "@/app/api/Session/UseLoginSession";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatUsdPrice } from "@/lib/payment";

type AdStatus = "pending" | "approved" | "rejected";

type AdCreator = {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
};

type Ad = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  rentType?: "hour" | "day" | "week" | "month";
  image: string;
  status: AdStatus;
  sellerID?: AdCreator | string | null;
  createdAt?: string;
  updatedAt?: string;
};

type StatusConfig = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

const statusConfig: Record<AdStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    icon: Clock3,
    iconClassName: "text-amber-600 dark:text-amber-300",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    iconClassName: "text-emerald-600 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    iconClassName: "text-rose-600 dark:text-rose-300",
  },
};

const statusOptions = (["pending", "approved", "rejected"] as const).map(
  (value) => ({ value, label: statusConfig[value].label }),
);

const rentTypeLabels: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
};

const formatPrice = formatUsdPrice;

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

const StatusIcon = ({
  status,
  className,
}: {
  status: AdStatus;
  className?: string;
}) => {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <Icon
      className={cn("size-3.5 shrink-0", config.iconClassName, className)}
      aria-hidden="true"
    />
  );
};

const getCreator = (sellerID: Ad["sellerID"]) => {
  if (!sellerID || typeof sellerID === "string") {
    return { name: "Unknown user", email: "" };
  }

  return {
    name: sellerID.name?.trim() || "Unknown user",
    email: sellerID.email ?? "",
  };
};

const TableSkeleton = () => (
  <Table>
    <TableHeader className="bg-muted/40">
      <TableRow>
        <TableHead className="w-24 pl-4">Image</TableHead>
        <TableHead>Ad</TableHead>
        <TableHead>Created by</TableHead>
        <TableHead>Price (USD)</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Posted</TableHead>
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
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ManageAds = () => {
  const { user, isPending } = useLoginSession();
  const adminID = user?.id;

  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, AdStatus>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAdID, setUpdatingAdID] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchAds = useCallback(
    async (signal?: AbortSignal) => {
      if (!adminID) return;

      try {
        setIsLoading(true);
        setError("");

        const { data: tokenData, error: tokenError } = await authClient.token();
        if (tokenError || !tokenData?.token) {
          throw new Error("Unauthorized. Please log in again.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ads/${adminID}`,
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
          throw new Error(result?.message || "Failed to load ads.");
        }
        if (!Array.isArray(result?.data)) {
          throw new Error("Unexpected response from the server.");
        }

        setAds(result.data as Ad[]);
        setSelectedStatuses({});
      } catch (caught) {
        if (signal?.aborted) return;
        setAds([]);
        setError(
          caught instanceof Error ? caught.message : "Failed to load ads.",
        );
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [adminID],
  );

  useEffect(() => {
    if (!adminID) return;

    const controller = new AbortController();
    // State updates happen after the network call resolves, not synchronously
    // in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAds(controller.signal);
    return () => controller.abort();
  }, [adminID, fetchAds, reloadKey]);

  const updateAdStatus = useCallback(
    async (adID: string, nextStatus: AdStatus, previousStatus: AdStatus) => {
      if (!adminID || nextStatus === previousStatus) return;

      setSelectedStatuses((current) => ({ ...current, [adID]: nextStatus }));
      setUpdatingAdID(adID);

      try {
        const { data: tokenData, error: tokenError } = await authClient.token();
        if (tokenError || !tokenData?.token) {
          throw new Error("Unauthorized. Please log in again.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${adminID}/ads/${adID}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: nextStatus }),
          },
        );

        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.message || "Failed to update status.");
        }
        if (!result?.success) {
          throw new Error("Unexpected response from the server.");
        }

        if (nextStatus === "pending") {
          setAds((current) =>
            current.map((item) =>
              item._id === adID ? { ...item, status: nextStatus } : item,
            ),
          );
        } else {
          setAds((current) => current.filter((item) => item._id !== adID));
        }

        setSelectedStatuses((current) => {
          const next = { ...current };
          delete next[adID];
          return next;
        });
        toast.success(result?.message || "Ad status updated successfully");
      } catch (caught) {
        setSelectedStatuses((current) => ({
          ...current,
          [adID]: previousStatus,
        }));
        toast.error(
          caught instanceof Error ? caught.message : "Failed to update status.",
        );
      } finally {
        setUpdatingAdID(null);
      }
    },
    [adminID],
  );

  if (!isPending && !adminID) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
        <AlertCircle className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Sign in to review ads
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending ads will appear here once you are signed in as an admin.
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
              Pending ads
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ads submitted by users and waiting for review.
            </p>
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
              Could not load ads
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {error}
            </p>
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
        ) : isPending || (adminID && isLoading) ? (
          <TableSkeleton />
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              No pending ads
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              New submissions from sellers will show up here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-24 pl-4">Image</TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => {
                const creator = getCreator(ad.sellerID);
                const currentStatus = selectedStatuses[ad._id] ?? ad.status;

                return (
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
                    <TableCell className="max-w-64">
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
                        {creator.name}
                      </p>
                      {creator.email && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {creator.email}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {formatPrice(ad.price)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        / {rentTypeLabels[ad.rentType ?? "day"] ?? "day"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Select
                        items={statusOptions}
                        value={currentStatus}
                        onValueChange={(value) =>
                          void updateAdStatus(
                            ad._id,
                            value as AdStatus,
                            currentStatus,
                          )
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-[9.5rem]"
                          aria-label={`Change status for ${ad.title}`}
                          disabled={updatingAdID === ad._id}
                        >
                          <StatusIcon status={currentStatus} />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectGroup>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <StatusIcon status={option.value} />
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ad.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
};

export default ManageAds;
