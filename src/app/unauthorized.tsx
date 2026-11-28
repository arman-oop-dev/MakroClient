import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="gap-0 py-0">
          <CardContent className="px-6 py-8 text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              401
            </p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">
              Sign in required
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session has expired or is invalid. Please sign in again to
              continue.
            </p>
            <Link
              href="/?signIn=1"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
            >
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
