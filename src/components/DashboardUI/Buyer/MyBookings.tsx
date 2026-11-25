import { CalendarCheck2, CreditCard, Package, ReceiptText } from "lucide-react";
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
import { getRentLabel } from "@/lib/booking";
import { getBuyerBookings } from "@/lib/booking-store";
import {
  formatPaymentDate,
  formatStripeSessionId,
  formatUsd,
} from "@/lib/payment";

const MyBookings = async () => {
  const session = await getDashboardSession();

  if (!session?.user) {
    redirect(
      `/?signIn=1&redirectTo=${encodeURIComponent("/dashboard/buyer/my-bookings")}`,
    );
  }

  if (session.user.role?.toLowerCase() !== "buyer") {
    redirect("/dashboard");
  }

  const bookings = await getBuyerBookings(session.user.id);
  const totalPaid = bookings.reduce(
    (total, booking) => total + booking.amountCents,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed bookings
            </CardTitle>
            <CalendarCheck2 className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {bookings.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total paid
            </CardTitle>
            <CreditCard className="size-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatUsd(totalPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your rentals</CardTitle>
          <CardDescription>
            Paid bookings appear here automatically after Stripe confirms payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">No bookings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rent an item from a listing and your confirmed booking will
                  show up here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Rental</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatPaymentDate(booking.paidAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{booking.adTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          <Package className="mr-1 inline size-3" aria-hidden="true" />
                          1 unit
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        1 {getRentLabel(booking.rentType)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-primary">
                        {formatUsd(booking.amountCents)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-6 gap-1 border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <CalendarCheck2 className="size-3" aria-hidden="true" />
                          Confirmed
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap font-mono text-xs text-muted-foreground"
                        title={booking.sessionId}
                      >
                        {formatStripeSessionId(booking.sessionId)}
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

export default MyBookings;
