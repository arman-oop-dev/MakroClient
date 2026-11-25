"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState, type KeyboardEvent, type ReactNode } from "react";

import SignIn from "@/components/NavbarUI/SignIn";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AuthProductLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

const AuthProductLink = ({
  href,
  className,
  ariaLabel,
  children,
}: AuthProductLinkProps) => {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  if (isPending) {
    return (
      <div className={className} aria-busy="true">
        {children}
      </div>
    );
  }

  if (session?.user) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const openLogin = () => setOpen(true);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLogin();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel ?? "Sign in to view product details"}
        aria-haspopup="dialog"
        onClick={openLogin}
        onKeyDown={handleKeyDown}
        className={cn(className, "cursor-pointer hover:cursor-pointer")}
      >
        {children}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md bg-accent-foreground">
          <AlertDialogCancel
            aria-label="Close sign in"
            className="absolute top-2 right-2 size-8 border-0 p-0 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden="true" />
          </AlertDialogCancel>

          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              Please sign in to view product details.
            </AlertDialogDescription>
            <SignIn redirectTo={href} onSuccess={() => setOpen(false)} />
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AuthProductLink;
