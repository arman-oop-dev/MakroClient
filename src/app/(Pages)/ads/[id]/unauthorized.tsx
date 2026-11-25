"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SignIn from "@/components/NavbarUI/SignIn";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Unauthorized() {
  const pathname = usePathname();

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link
          href="/browse-ads"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-5")}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to browse
        </Link>

        <Card className="gap-0 py-0">
          <CardContent className="px-6 py-8">
            <h1 className="text-xl font-semibold text-foreground">
              Sign in to view product details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please log in to continue browsing this equipment.
            </p>

            <div className="mt-6">
              <SignIn redirectTo={pathname} />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
