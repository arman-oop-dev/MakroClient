"use client";

import { authClient } from "@/lib/auth-client";

export const useLoginSession = () => {
  const { data: session, isPending } = authClient.useSession();

  return {
    session,
    isPending,
    user: session?.user ?? null,
  };
};
