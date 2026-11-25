import { CreditCard, ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RENTAL_PRODUCT_NAME } from "@/lib/booking";
import { getBuyerRentalPayments } from "@/lib/booking-store";
import {
  formatPaymentDate,
  formatStripeSessionId,
  formatUsd,
} from "@/lib/payment";
import { cn } from "cn";

const browseLinkClass = cn(buttonVariants({ size: "lg" }), "h-11 w-full sm:w-auto");

const PaymentHistory = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(
      `/?signIn=1&redirectTo=${encodeURIComponent("/dashboard/buyer/payment-history")}`,
    );
  }

  if (session.user.role?.toLowerCase() !== "buyer") {
    redirect("/dashboard");
  }

  const payments = await getBuyerRentalPayments(session.user.id);
  const totalPaid = payments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  );

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total paid for rentals
          </CardTitle>
          <CreditCard className="size-4 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">
            {formatUsd(totalPaid)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>
            Completed Stripe payments for your rentals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">No payments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paid rentals will appear here after checkout.
                </p>
              </div>
              <Link href="/browse-ads" className={browseLinkClass}>
                Browse ads
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatPaymentDate(payment.paidAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{RENTAL_PRODUCT_NAME}</p>
                        {payment.adTitle && (
                          <p className="text-xs text-muted-foreground">
                            {payment.adTitle}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-primary">
                        {formatUsd(payment.amountCents)}
                      </TableCell>
                      <TableCell className="text-emerald-700 dark:text-emerald-300">
                        Paid
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap font-mono text-xs text-muted-foreground"
                        title={payment.sessionId}
                      >
                        {formatStripeSessionId(payment.sessionId)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PaymentHistory;
