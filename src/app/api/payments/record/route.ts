import { auth } from "@/lib/auth";
import { isSellerProCheckout } from "@/lib/payment";
import { recordSellerPayment } from "@/lib/payment-store";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => null)) as {
      sessionId?: unknown;
    } | null;
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.trim() : "";

    if (!sessionId) {
      return NextResponse.json(
        { error: "A Stripe session ID is required." },
        { status: 400 },
      );
    }

    const checkoutSession = await getStripe().checkout.sessions.retrieve(
      sessionId,
    );

    const belongsToUser =
      checkoutSession.client_reference_id === session.user.id ||
      checkoutSession.metadata?.userId === session.user.id;

    if (!belongsToUser) {
      return NextResponse.json(
        { error: "This payment belongs to another account." },
        { status: 403 },
      );
    }

    const isPaid =
      checkoutSession.payment_status === "paid" &&
      checkoutSession.status === "complete";

    if (!isPaid) {
      return NextResponse.json(
        { error: "Stripe has not confirmed this payment yet." },
        { status: 400 },
      );
    }

    if (!isSellerProCheckout(checkoutSession)) {
      return NextResponse.json(
        { error: "This is not a seller pro payment." },
        { status: 400 },
      );
    }

    const payment = await recordSellerPayment({
      userId: session.user.id,
      sessionId: checkoutSession.id,
      amountCents: checkoutSession.amount_total ?? 0,
      currency: checkoutSession.currency ?? "usd",
      email:
        checkoutSession.customer_details?.email ??
        checkoutSession.customer_email ??
        session.user.email ??
        "",
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Failed to record seller payment", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the payment.",
      },
      { status: 500 },
    );
  }
}
