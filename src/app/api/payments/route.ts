import { auth } from "@/lib/auth";
import { getSellerPayments, hasPaidSellerPayment } from "@/lib/payment-store";
import { headers } from "next/headers";
import { connection, NextResponse } from "next/server";

export async function GET() {
  await connection();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role?.toLowerCase() !== "seller") {
      return NextResponse.json(
        { error: "Seller access is required." },
        { status: 403 },
      );
    }

    const [payments, hasPaid] = await Promise.all([
      getSellerPayments(session.user.id),
      hasPaidSellerPayment(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      hasPaid,
      payments,
    });
  } catch (error) {
    console.error("Failed to load seller payments", error);

    return NextResponse.json(
      { error: "Unable to load payment history." },
      { status: 500 },
    );
  }
}
