"use client";
import { authClient } from "@/lib/auth-client";

import { useState, type FormEvent } from "react";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import Registration from "./Registration";

interface SignInProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const validateEmail = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }

  return "";
};

const validatePassword = (value: string) => {
  if (!value) return "Password is required.";

  return "";
};

const SignIn = ({ onSuccess, redirectTo }: SignInProps) => {
  const router = useRouter();
  const [view, setView] = useState<"signin" | "registration">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setView("signin");
    onSuccess?.();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setLoginError("");

    if (emailValidation || passwordValidation) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message || "Sign in failed. Please try again.");
        return;
      }
      if (data) {
        const role =
          (data.user as { role?: string } | undefined)?.role?.toLowerCase() ||
          "buyer";
        handleSuccess();
        router.push(redirectTo ?? `/dashboard/${role}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === "registration") {
    return (
      <Registration
        onSignIn={() => setView("signin")}
        onSuccess={handleSuccess}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Sign in via email
      </h2>

      {loginError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {loginError}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={emailError ? true : undefined}>
            <FieldLabel htmlFor="signin-email">Email</FieldLabel>
            <Input
              id="signin-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              onChange={(event) => {
                setLoginError("");
                if (emailError) {
                  setEmailError(validateEmail(event.currentTarget.value));
                }
              }}
              onBlur={(event) =>
                setEmailError(validateEmail(event.currentTarget.value))
              }
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "signin-email-error" : undefined}
            />
            {emailError && (
              <FieldDescription
                id="signin-email-error"
                role="alert"
                className="text-destructive text-red-600"
              >
                {emailError}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={passwordError ? true : undefined}>
            <FieldLabel htmlFor="signin-password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
                onChange={(event) => {
                  setLoginError("");
                  if (passwordError) {
                    setPasswordError(
                      validatePassword(event.currentTarget.value),
                    );
                  }
                }}
                onBlur={(event) =>
                  setPasswordError(validatePassword(event.currentTarget.value))
                }
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={
                  passwordError ? "signin-password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <FiEye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordError && (
              <FieldDescription
                id="signin-password-error"
                role="alert"
                className="text-destructive text-red-600"
              >
                {passwordError}
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="h-11 w-full text-base font-semibold hover:cursor-pointer"
        >
          {isSubmitting ? "Sign In..." : "Sign In"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="w-full hover:cursor-pointer"
      >
        <FaGoogle aria-hidden="true" />
        Login via Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => setView("registration")}
          className="text-primary font-medium hover:underline focus-visible:underline focus-visible:outline-none hover:cursor-pointer"
        >
          Registration
        </button>
      </p>
    </div>
  );
};

export default SignIn;
