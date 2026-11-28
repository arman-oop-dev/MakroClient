import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

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
import { auth } from "@/lib/auth";
import {
  formatUsd,
  isSellerProCheckout,
  SELLER_PRICE_CENTS,
} from "@/lib/payment";
import { recordSellerPayment } from "@/lib/payment-store";
import { getStripe } from "@/lib/stripe";
import { cn } from "cn";

const backToCheckoutClass = cn(
  buttonVariants({ variant: "outline", size: "lg" }),
  "h-11",
);

type StatusCardProps = {
  title: string;
  description: string;
  success?: boolean;
  footerHref?: string;
  footerLabel?: string;
  children?: ReactNode;
};

const StatusCard = ({
  title,
  description,
  success = false,
  footerHref = "/dashboard/seller/payment-history/checkout",
  footerLabel = "Back to checkout",
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
          <Link href={footerHref} className={backToCheckoutClass}>
            {!success && <ArrowLeft aria-hidden="true" />}
            {footerLabel}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
};

const CheckoutSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  const { session_id } = await searchParams;
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session?.user) {
    redirect("/");
  }

  if (String(session.user.role ?? "").toLowerCase() !== "seller") {
    return (
      <StatusCard
        title="Seller access is required"
        description="Only seller accounts can activate selling access."
        footerHref="/dashboard"
        footerLabel="Back to dashboard"
      />
    );
  }

  if (!session_id) {
    return (
      <StatusCard
        title="Checkout session missing"
        description="We could not find a Stripe session to verify. Start checkout again."
      />
    );
  }

  let checkoutSession;

  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(session_id);
  } catch (error) {
    console.error("Failed to retrieve Stripe Checkout Session", error);

    return (
      <StatusCard
        title="Could not verify payment"
        description="We could not verify this Stripe session. Please contact support if you were charged."
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
        description="Sign in with the account that started the checkout to see this receipt."
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

  if (!isSellerProCheckout(checkoutSession)) {
    return (
      <StatusCard
        title="This payment does not unlock selling"
        description="The Stripe session is not for the Markro Selling Pro Account. Start the seller checkout to continue."
      />
    );
  }

  const amount = checkoutSession.amount_total ?? SELLER_PRICE_CENTS;
  const email =
    checkoutSession.customer_details?.email ?? checkoutSession.customer_email;

  try {
    await recordSellerPayment({
      userId: session.user.id,
      sessionId: checkoutSession.id,
      amountCents: amount,
      currency: checkoutSession.currency ?? "usd",
      email: email ?? session.user.email ?? "",
    });
  } catch (error) {
    console.error("Failed to save seller payment", error);

    return (
      <StatusCard
        title="Payment confirmed, but we could not save it"
        description="Your payment was successful. Please contact support so we can restore your posting access."
      />
    );
  }

  return (
    <StatusCard
      success
      title="Payment successful"
      description="Your payment is confirmed. You can now keep posting ads without another checkout."
      footerHref="/dashboard/seller/payment-history"
      footerLabel="View payment history"
    >
      <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-left">
        <Badge variant="outline" className="mb-3 gap-1.5">
          <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
          Paid
        </Badge>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Product</span>
            <span className="font-medium">Markro Selling Pro Account</span>
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

        <Separator className="my-4" />

        <p className="truncate text-xs text-muted-foreground">
          Stripe session: {checkoutSession.id}
        </p>
      </div>

      <Link
        href="/dashboard/seller/payment-history"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
      >
        View payment history
      </Link>
    </StatusCard>
  );
};

export default CheckoutSuccessPage;
