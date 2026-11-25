import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ReceiptText,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { getDashboardSession } from "@/app/api/Session/GetDashboardSession";
import { Badge } from "@/components/ui/badge";
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
import { getPaymentDescription } from "@/lib/booking";
import {
  formatPaymentDate,
  formatStripeSessionId,
  formatUsd,
} from "@/lib/payment";
import { getAllPaymentsForAdmin } from "@/lib/payment-store";
import { cn } from "cn";

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = normalizeStatus(status);
  const isPaid = normalized === "paid";
  const label = normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "Unknown";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1 px-2",
        isPaid
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      )}
    >
      {isPaid ? (
        <CheckCircle2 className="size-3" aria-hidden="true" />
      ) : (
        <Clock3 className="size-3" aria-hidden="true" />
      )}
      {label}
    </Badge>
  );
};

const PaymentManagement = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(
      `/?signIn=1&redirectTo=${encodeURIComponent("/dashboard/admin/payment-management")}`,
    );
  }

  if (session.user.role?.toLowerCase() !== "admin") {
    redirect("/dashboard");
  }

  const payments = await getAllPaymentsForAdmin();
  const paidPayments = payments.filter(
    (payment) => normalizeStatus(payment.status) === "paid",
  );
  const totalRevenue = paidPayments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  );
  const sellerCount = new Set(payments.map((payment) => payment.userId)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total revenue
            </CardTitle>
            <CreditCard
              className="size-4 text-primary"
              aria-hidden="true"
            />
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
              Completed payments
            </CardTitle>
            <CheckCircle2
              className="size-4 text-emerald-600"
              aria-hidden="true"
            />
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
              Paying customers
            </CardTitle>
            <Users className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {sellerCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All payments</CardTitle>
          <CardDescription>
            Every payment recorded across seller and buyer accounts.
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
                  Completed seller and rental payments will appear here.
                </p>
              </div>
            </div>
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
                    <TableHead>Stripe session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
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
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap font-mono text-xs text-muted-foreground"
                        title={payment.sessionId}
                      >
                        {payment.sessionId
                          ? formatStripeSessionId(payment.sessionId)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;
