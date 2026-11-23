// for using navbar
import { authClient } from "@/lib/auth-client";
export const getLoginSession = async () => {
  const { data: session } = await authClient.getSession();

  if (!session) {
    throw new Error("User isn't valid or exist");
  }

  return session;
};
