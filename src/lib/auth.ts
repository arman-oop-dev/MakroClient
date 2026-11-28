import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { admin, jwt } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { MongoClient } from "mongodb";

import { parseSignupRole } from "@/lib/roles";

const url = process.env.BETTER_AUTH_DB_URL;

if (!url) {
  throw new Error("BETTER_AUTH_DB_URL is missing from environment variables");
}

const client = new MongoClient(url);
const db = client.db("markro");

const configuredAppUrl =
  process.env.NEXT_APP_URL?.trim() ||
  process.env.BETTER_AUTH_URL?.trim() ||
  undefined;

const configuredAppHost = (() => {
  if (!configuredAppUrl) return undefined;

  try {
    return new URL(configuredAppUrl).host;
  } catch {
    return undefined;
  }
})();

const baseURL = {
  allowedHosts: [
    ...(configuredAppHost ? [configuredAppHost] : []),
    "makro-phi.vercel.app",
    "*.vercel.app",
    "localhost:3000",
    "localhost",
    "127.0.0.1:3000",
    "127.0.0.1",
  ],
  fallback: configuredAppUrl ?? "http://localhost:3000",
  protocol: "auto" as const,
};

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

type UserWithRequestedRole = Record<string, unknown> & {
  requestedRole?: unknown;
};

export const auth = betterAuth({
  baseURL,

  advanced: {
    trustedProxyHeaders: true,
  },

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders,

  user: {
    additionalFields: {
      // Clients may only request buyer/seller at signup. The final role is
      // assigned by the create hook below; admin is never self-assignable.
      requestedRole: {
        type: "string",
        required: false,
        input: true,
        returned: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const data = { ...user } as UserWithRequestedRole;
          const requestedRole = data.requestedRole;
          delete data.requestedRole;

          return { data: { ...data, role: parseSignupRole(requestedRole) } };
        },
      },
      update: {
        async before(user) {
          const data = { ...user } as UserWithRequestedRole;
          delete data.requestedRole;

          return { data };
        },
      },
    },
  },

  plugins: [
    jwt(),
    admin({
      defaultRole: "buyer",
      adminRoles: ["admin"],
      roles: {
        admin: adminAc,
        buyer: userAc,
        seller: userAc,
      },
    }),
  ],

  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },
});
