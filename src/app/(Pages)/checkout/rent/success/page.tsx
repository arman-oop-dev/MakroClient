import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApprovedAdById } from "@/lib/ads";
import { auth } from "@/lib/auth";
import { getRentLabel, RENTAL_PRODUCT } from "@/lib/booking";
import { recordBuyerBooking } from "@/lib/booking-store";
import { formatStripeSessionId, formatUsd } from "@/lib/payment";
import { getStripe } from "@/lib/stripe";
import { cn } from "cn";

const bookingsHref = "/dashboard/buyer/my-bookings";
const backToBrowseClass = cn(
  buttonVariants({ variant: "outline", size: "lg" }),
  "h-11",
);

type StatusCardProps = {
  title: string;
  description: string;
  success?: boolean;
  children?: ReactNode;
};

const StatusCard = ({
  title,
  description,
  success = false,
  children,
}: StatusCardProps) => {
  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <section className="mx-auto max-w-xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div
            className={cn(
              "mx-auto flex size-12 items-center justify-center rounded-full",
              success
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>

        {children && <CardContent className="space-y-4">{children}</CardContent>}

        <CardFooter className="justify-center border-t border-border/70 bg-muted/10">
          <Link href={success ? bookingsHref : "/browse-ads"} className={backToBrowseClass}>
            {!success && <ArrowLeft aria-hidden="true" />}
            {success ? "View my bookings" : "Back to browse"}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
};

const RentalSuccess = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  const { session_id } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/?signIn=1&redirectTo=/browse-ads");
  }

  if (!session_id) {
    return (
      <StatusCard
        title="Checkout session missing"
        description="We could not find a Stripe session to verify. Start the rental again."
      />
    );
  }

  let checkoutSession;

  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(session_id);
  } catch (error) {
    console.error("Failed to retrieve rental Stripe Checkout Session", error);

    return (
      <StatusCard
        title="Could not verify payment"
        description="We could not verify this Stripe session. Contact support if you were charged."
      />
    );
  }

  const belongsToUser =
    checkoutSession.client_reference_id === session.user.id ||
    checkoutSession.metadata?.userId === session.user.id;

  if (!belongsToUser) {
    return (
      <StatusCard
        title="Session does not belong to this account"
        description="Sign in with the account that started the rental checkout."
      />
    );
  }

  if (checkoutSession.metadata?.product !== RENTAL_PRODUCT) {
    return (
      <StatusCard
        title="This is not a rental checkout"
        description="Open a rental ad and click Rent to start a new checkout."
      />
    );
  }

  const isPaid =
    checkoutSession.payment_status === "paid" &&
    checkoutSession.status === "complete";

  if (!isPaid) {
    return (
      <StatusCard
        title="Payment is not complete"
        description="Stripe has not confirmed this payment yet. Please try again or contact support."
      />
    );
  }

  const adId = checkoutSession.metadata?.adId ?? "";

  if (!adId) {
    return (
      <StatusCard
        title="Rental details are missing"
        description="Stripe did not return the rental item. Contact support with your session ID."
      />
    );
  }

  const ad = await getApprovedAdById(adId).catch(() => null);
  const adTitle = ad?.title ?? checkoutSession.metadata?.adTitle ?? "Rental item";
  const rentType = ad?.rentType ?? checkoutSession.metadata?.rentType ?? "day";
  const sellerId =
    typeof ad?.sellerID === "object"
      ? ad?.sellerID?._id ?? ""
      : ad?.sellerID ?? "";
  const email =
    checkoutSession.customer_details?.email ??
    checkoutSession.customer_email ??
    session.user.email ??
    "";
  const amount =
    checkoutSession.amount_total ??
    Number(checkoutSession.metadata?.amountCents ?? 0);

  let result: Awaited<ReturnType<typeof recordBuyerBooking>>;

  try {
    result = await recordBuyerBooking({
      userId: session.user.id,
      userEmail: email,
      adId,
      adTitle,
      sellerId,
      sessionId: checkoutSession.id,
      amountCents: amount,
      currency: checkoutSession.currency ?? "usd",
      rentType,
    });
  } catch (error) {
    console.error("Failed to save rental booking", error);

    return (
      <StatusCard
        title="Payment confirmed, but we could not save it"
        description="Your payment was successful. Contact support so we can restore your booking."
      />
    );
  }

  return (
    <StatusCard
      success
      title="Rental confirmed"
      description={
        result.bookingCreated
          ? "Your payment is confirmed and the booking is now in My Bookings."
          : "This payment was already recorded. Your booking is in My Bookings."
      }
    >
      <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-left">
        <Badge variant="outline" className="mb-3 gap-1.5">
          <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
          Paid
        </Badge>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Item</span>
            <span className="truncate font-medium">{adTitle}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Rental</span>
            <span className="font-medium">1 {getRentLabel(rentType)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-semibold text-primary">
              {formatUsd(amount)}
            </span>
          </div>
          {email && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Receipt sent to</span>
              <span className="truncate font-medium">{email}</span>
            </div>
          )}
        </div>

        {result.bookingCreated && !result.quantityUpdated && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Your payment and booking are saved. The listing quantity could not
            be updated automatically; please contact support.
          </p>
        )}

        <Separator className="my-4" />

        <p className="truncate text-xs text-muted-foreground" title={checkoutSession.id}>
          Stripe session: {formatStripeSessionId(checkoutSession.id)}
        </p>
      </div>

      <Link
        href={bookingsHref}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
      >
        View my bookings
      </Link>
    </StatusCard>
  );
};

const RentalSuccessPage = ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-80 w-full rounded-2xl bg-muted/40" />}>
          <RentalSuccess searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
};

export default RentalSuccessPage;
