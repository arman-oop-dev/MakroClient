import { ArrowUpRight, CreditCard, ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";
import { Badge } from "@/components/ui/badge";
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
import { getPaymentDescription, RENTAL_PRODUCT } from "@/lib/booking";
import {
  formatPaymentDate,
  formatStripeSessionId,
  formatUsd,
} from "@/lib/payment";
import { getAllPaymentsForAdmin } from "@/lib/payment-store";
import { cn } from "cn";

const managePaymentsClass = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "h-9",
);

const AdminPaymentSummary = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(
      `/?signIn=1&redirectTo=${encodeURIComponent("/dashboard/admin")}`,
    );
  }

  if (session.user.role?.toLowerCase() !== "admin") {
    redirect("/dashboard");
  }

  const payments = await getAllPaymentsForAdmin();
  const paidPayments = payments.filter(
    (payment) => payment.status.toLowerCase() === "paid",
  );
  const totalRevenue = paidPayments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  );
  const rentalPayments = payments.filter(
    (payment) => payment.product === RENTAL_PRODUCT,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Payment overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest payments from sellers and renters.
          </p>
        </div>
        <Link href="/dashboard/admin/payment-management" className={managePaymentsClass}>
          Manage payments
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total revenue
            </CardTitle>
            <CreditCard className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatUsd(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments
            </CardTitle>
            <ReceiptText className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {paidPayments.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rental payments
            </CardTitle>
            <ArrowUpRight className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {rentalPayments.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
          <CardDescription>
            The five most recent completed payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No payments have been recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatPaymentDate(payment.paidAt || payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.sellerName}</p>
                        {payment.sellerEmail && (
                          <p className="text-xs text-muted-foreground">
                            {payment.sellerEmail}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{getPaymentDescription(payment)}</TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-primary">
                        {formatUsd(payment.amountCents)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-6 border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          {payment.status}
                        </Badge>
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

export default AdminPaymentSummary;
