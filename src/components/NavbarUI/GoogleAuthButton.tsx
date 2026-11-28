"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface GoogleAuthButtonProps {
  redirectTo?: string;
  dividerLabel?: string;
  disabled?: boolean;
  onStart?: () => void;
  onError?: (message: string) => void;
}

const getGoogleAuthErrorMessage = (error: unknown) => {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) return message;
  }

  return "Google sign-in failed. Please try again.";
};

const GoogleAuthButton = ({
  redirectTo,
  dividerLabel = "or continue with email",
  disabled,
  onStart,
  onError,
}: GoogleAuthButtonProps) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleAuth = async () => {
    if (isRedirecting || disabled) return;

    setIsRedirecting(true);
    onStart?.();

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo ?? "/dashboard",
      });

      if (error) {
        onError?.(getGoogleAuthErrorMessage(error));
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Unexpected Google sign-in error:", error);
      onError?.(getGoogleAuthErrorMessage(error));
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isRedirecting}
        aria-busy={isRedirecting}
        onClick={() => void handleGoogleAuth()}
        className="h-11 w-full text-base font-medium hover:cursor-pointer"
      >
        <FcGoogle className="size-5 shrink-0" aria-hidden="true" />
        {isRedirecting ? "Redirecting to Google..." : "Continue with Google"}
      </Button>

      <div
        className="flex items-center gap-3 text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-border" />
        <span>{dividerLabel}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
