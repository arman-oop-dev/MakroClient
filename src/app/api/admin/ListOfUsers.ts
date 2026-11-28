import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { parseUserRole, type UserRole } from "@/lib/roles";

export class AdminAccessError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  createdAt?: string;
  emailVerified: boolean;
};

type ListedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  createdAt?: Date | string | null;
  emailVerified?: boolean | null;
};

const serializeUser = (user: ListedUser): AdminUser => ({
  id: user.id,
  name: user.name?.trim() || "Unnamed user",
  email: user.email ?? "",
  image: user.image,
  role: parseUserRole(user.role) ?? "buyer",
  createdAt:
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : typeof user.createdAt === "string"
        ? user.createdAt
        : undefined,
  emailVerified: Boolean(user.emailVerified),
});

async function getAdminContext() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session?.user) {
    throw new AdminAccessError("Please sign in to continue.", 401);
  }

  if (parseUserRole(session.user.role) !== "admin") {
    throw new AdminAccessError("Admin access is required.", 403);
  }

  return { headerList, userId: session.user.id };
}

export async function listUsersForAdmin() {
  const { headerList, userId } = await getAdminContext();

  const result = await auth.api.listUsers({
    query: {
      sortBy: "createdAt",
      sortDirection: "desc",
      limit: 500,
    },
    headers: headerList,
  });

  return {
    currentUserId: userId,
    users: result.users.map((user) => serializeUser(user as ListedUser)),
    total: result.total,
  };
}

export async function setUserRoleForAdmin(userId: string, role: UserRole) {
  const { headerList, userId: currentUserId } = await getAdminContext();

  if (userId === currentUserId) {
    throw new AdminAccessError("You cannot change your own role.", 400);
  }

  const result = await auth.api.setRole({
    body: { userId, role },
    headers: headerList,
  });

  return serializeUser(result.user as ListedUser);
}
