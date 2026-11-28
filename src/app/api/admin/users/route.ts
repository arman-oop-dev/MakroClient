import { NextResponse, type NextRequest } from "next/server";

import {
  AdminAccessError,
  listUsersForAdmin,
  setUserRoleForAdmin,
} from "@/app/api/admin/ListOfUsers";
import { parseUserRole } from "@/lib/roles";

const toErrorResponse = (error: unknown) => {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Admin users API failed", error);

  return NextResponse.json(
    { error: "Unable to complete the request." },
    { status: 500 },
  );
};

export async function GET() {
  try {
    return NextResponse.json(await listUsersForAdmin());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      userId?: unknown;
      role?: unknown;
    } | null;

    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    const role = parseUserRole(body?.role);

    if (!userId || !role) {
      return NextResponse.json(
        { error: "A valid user and role are required." },
        { status: 400 },
      );
    }

    const user = await setUserRoleForAdmin(userId, role);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
