import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const url = process.env.BETTER_AUTH_DB_URL;

if (!url) {
  throw new Error("BETTER_AUTH_DB_URL is missing from environment variables");
}

const client = new MongoClient(url);
const db = client.db("markro");

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
      role: {
        type: "string",
        required: true,
      },
    },
  },
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },
});
