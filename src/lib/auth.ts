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

type UserWithRequestedRole = Record<string, unknown> & {
  requestedRole?: unknown;
};

export const auth = betterAuth({
  baseURL: process.env.NEXT_APP_URL,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

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
