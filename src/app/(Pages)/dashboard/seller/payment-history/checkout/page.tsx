import { Check, CircleAlert } from "lucide-react";
import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatUsd, SELLER_PRICE_CENTS } from "@/lib/payment";
import { hasPaidSellerPayment } from "@/lib/payment-store";

const PAYMENT_AMOUNT = formatUsd(SELLER_PRICE_CENTS);

const CheckoutPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) => {
  const { canceled } = await searchParams;
  const session = await getDashboardSession();
  const redirectTo = encodeURIComponent(
    "/dashboard/seller/payment-history/checkout",
  );

  if (!session?.user) {
    redirect(`/?signIn=1&redirectTo=${redirectTo}`);
  }

  if (session.user.role?.toLowerCase() !== "seller") {
    redirect("/dashboard");
  }

  if (await hasPaidSellerPayment(session.user.id)) {
    redirect("/dashboard/seller/my-ads");
  }

  return (
    <section className="mx-auto grid max-w-4xl items-start gap-6 lg:grid-cols-2">
      {canceled && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 lg:col-span-2">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Checkout canceled</p>
            <p className="text-amber-800">
              No payment was taken. You can try again whenever you are ready.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Markro Selling Pro Account</p>
              <p className="text-xs text-muted-foreground">
                Charged once. No recurring billing.
              </p>
            </div>
            <span className="text-sm font-semibold">{PAYMENT_AMOUNT}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{PAYMENT_AMOUNT}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>$0.00</span>
          </div>

          <Separator />

          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Total due today</span>
            <span className="text-2xl font-semibold tracking-tight text-primary">
              {PAYMENT_AMOUNT}
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/70 bg-muted/10">
          <form
            action="/dashboard/seller/payment-history/checkout/checkout_sessions"
            method="POST"
            className="w-full"
          >
            <Button
              size="lg"
              className="h-11 w-full text-sm font-semibold"
              type="submit"
            >
              Pay {PAYMENT_AMOUNT}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>What&apos;s included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {[
              `One-time checkout for ${PAYMENT_AMOUNT}`,
              "No subscription or renewal",
              "Stripe-hosted secure payment",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default CheckoutPage;
