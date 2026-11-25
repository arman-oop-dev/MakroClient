import { CheckCircle2, CreditCard, ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatPaymentDate,
  formatStripeSessionId,
  formatUsd,
  SELLER_PRODUCT_NAME,
} from "@/lib/payment";
import { getSellerPayments } from "@/lib/payment-store";
import { cn } from "cn";

const checkoutHref = "/dashboard/seller/payment-history/checkout";

const primaryLinkClass = cn(
  buttonVariants({ size: "lg" }),
  "h-11 w-full sm:w-auto",
);

const PaymentHistory = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(
      `/?signIn=1&redirectTo=${encodeURIComponent("/dashboard/seller/payment-history")}`,
    );
  }

  if (session.user.role?.toLowerCase() !== "seller") {
    redirect("/dashboard");
  }

  const payments = await getSellerPayments(session.user.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Payment History
          </h1>
          <p className="text-sm text-muted-foreground">
            Your completed one-time seller payments.
          </p>
        </div>

        {payments.length > 0 ? (
          <Badge
            variant="outline"
            className="h-8 w-fit gap-1.5 border-primary/30 bg-primary/5 px-3 text-primary"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Unlimited posting unlocked
          </Badge>
        ) : (
          <Badge variant="outline" className="h-8 w-fit px-3 text-muted-foreground">
            2 free ads available
          </Badge>
        )}
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ReceiptText className="size-6" aria-hidden="true" />
            </div>
            <CardTitle>No payments yet</CardTitle>
            <CardDescription className="max-w-md">
              You can post your first 2 ads for free. After that, a one-time
              payment unlocks unlimited posting. Completed payments will appear
              here.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center border-t border-border/70 bg-muted/10">
            <Link href={checkoutHref} className={primaryLinkClass}>
              <CreditCard aria-hidden="true" />
              View checkout
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Only successfully completed payments are listed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <p className="font-medium">{SELLER_PRODUCT_NAME}</p>
                        {payment.email && (
                          <p className="text-xs text-muted-foreground">
                            {payment.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-primary">
                        {formatUsd(payment.amountCents)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-6 gap-1 border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {formatStripeSessionId(payment.sessionId)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/70 bg-muted/10">
            <Link
              href="/dashboard/seller/my-ads"
              className={primaryLinkClass}
            >
              Create more ads
            </Link>
          </CardFooter>
        </Card>
      )}
    </section>
  );
};

export default PaymentHistory;
