import { getAppOrigin } from "@/lib/app-url";
import { auth } from "@/lib/auth";
import {
  SELLER_PRICE_CENTS,
  SELLER_PRODUCT_NAME,
  SELLER_PRO_PRODUCT,
} from "@/lib/payment";
import { hasPaidSellerPayment } from "@/lib/payment-store";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("signIn", "1");
      loginUrl.searchParams.set(
        "redirectTo",
        "/dashboard/seller/payment-history/checkout",
      );
      return NextResponse.redirect(loginUrl, 303);
    }

    if (session.user.role?.toLowerCase() !== "seller") {
      return NextResponse.json(
        { error: "Seller access is required for checkout." },
        { status: 403 },
      );
    }

    const origin = getAppOrigin(request.nextUrl.origin);

    if (await hasPaidSellerPayment(session.user.id)) {
      return NextResponse.redirect(
        new URL("/dashboard/seller/my-ads", origin),
        303,
      );
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: SELLER_PRODUCT_NAME,
            },
            unit_amount: SELLER_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      client_reference_id: session.user.id,
      ...(session.user.email
        ? { customer_email: session.user.email }
        : {}),
      metadata: {
        userId: session.user.id,
        product: SELLER_PRO_PRODUCT,
      },
      success_url: `${origin}/dashboard/seller/payment-history/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/seller/payment-history/checkout?canceled=true`,
      integration_identifier: "markro_seller_premium_web_payment",
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.redirect(checkoutSession.url, 303);
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout. Please try again.",
      },
      { status: 500 },
    );
  }
}
