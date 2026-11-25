import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getApprovedAdById } from "@/lib/ads";
import { getAdPriceInCents, getRentLabel, RENTAL_PRODUCT } from "@/lib/booking";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const redirectToAd = (request: NextRequest, adId: string, status: string) => {
  const url = new URL(`/ads/${encodeURIComponent(adId)}`, request.url);
  url.searchParams.set("checkout", status);
  return NextResponse.redirect(url, 303);
};

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const adId = String(formData?.get("adId") ?? "").trim();

  if (!adId) {
    return NextResponse.json(
      { error: "A rental ad is required." },
      { status: 400 },
    );
  }

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session?.user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("signIn", "1");
    loginUrl.searchParams.set("redirectTo", `/ads/${adId}`);
    return NextResponse.redirect(loginUrl, 303);
  }

  if (session.user.role?.toLowerCase() !== "buyer") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  let ad;

  try {
    ad = await getApprovedAdById(adId);
  } catch (error) {
    console.error("Failed to load ad for rental checkout", error);
    return redirectToAd(request, adId, "error");
  }

  if (!ad || ad.quantity === undefined || ad.quantity < 1) {
    return redirectToAd(request, adId, "unavailable");
  }

  let amountCents: number;

  try {
    amountCents = getAdPriceInCents(ad.price);
  } catch {
    return redirectToAd(request, adId, "unavailable");
  }

  const rentLabel = getRentLabel(ad.rentType);
  const origin = new URL("/", headerList.get("origin") ?? request.nextUrl.origin)
    .origin;
  const successUrl = `${origin}/checkout/rent/success?session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = new URL(`/ads/${encodeURIComponent(adId)}`, origin);
  cancelUrl.searchParams.set("checkout", "canceled");

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${ad.title} (${rentLabel} rental)`,
            },
            unit_amount: amountCents,
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
        product: RENTAL_PRODUCT,
        adId,
        adTitle: ad.title.slice(0, 200),
        rentType: ad.rentType ?? "day",
        amountCents: String(amountCents),
      },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      integration_identifier: "markro_rental_web_payment",
    });

    if (!checkoutSession.url) {
      return redirectToAd(request, adId, "error");
    }

    return NextResponse.redirect(checkoutSession.url, 303);
  } catch (error) {
    console.error("Failed to create rental Stripe Checkout Session", error);
    return redirectToAd(request, adId, "error");
  }
}
