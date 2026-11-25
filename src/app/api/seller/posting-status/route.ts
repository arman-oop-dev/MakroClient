import { auth } from "@/lib/auth";
import { getSellerPostingStatus } from "@/lib/payment-store";
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

    const status = await getSellerPostingStatus(session.user.id);

    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    console.error("Failed to load seller posting status", error);

    return NextResponse.json(
      { error: "Unable to load posting status." },
      { status: 500 },
    );
  }
}
