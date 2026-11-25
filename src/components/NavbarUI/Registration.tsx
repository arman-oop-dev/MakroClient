"use client";

import { useState, type FormEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface RegistrationProps {
  onSignIn: () => void;
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

  const requirements: string[] = [];

  if (value.length < 8) requirements.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) requirements.push("one uppercase letter");
  if (!/[a-z]/.test(value)) requirements.push("one lowercase letter");
  if (!/\d/.test(value)) requirements.push("one number");
  if (!/[^A-Za-z0-9\s]/.test(value)) requirements.push("one special character");

  if (requirements.length === 0) return "";

  return `Password must contain ${requirements.join(", ")}.`;
};

const validateFullName = (value: string) => {
  if (!value.trim()) return "Full name is required.";

  return "";
};

const validateRole = (value: string) => {
  if (value !== "buyer" && value !== "seller") {
    return "Select a valid account type.";
  }

  return "";
};

type SignUpError = {
  message?: unknown;
  status?: number;
  statusText?: string;
  error?: unknown;
};

const getRegistrationErrorMessage = (error: unknown) => {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;

  if (error && typeof error === "object") {
    const signUpError = error as SignUpError;

    if (typeof signUpError.message === "string" && signUpError.message.trim()) {
      return signUpError.message;
    }

    if (typeof signUpError.error === "string" && signUpError.error.trim()) {
      return signUpError.error;
    }

    if (signUpError.status) {
      const statusText = signUpError.statusText
        ? ` ${signUpError.statusText}`
        : "";
      return `Registration failed (${signUpError.status}${statusText}). Please try again.`;
    }
  }

  return "Registration failed. Please try again.";
};

const Registration = ({
  onSignIn,
  onSuccess,
  redirectTo,
}: RegistrationProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const fullName = String(formData.get("fullName") ?? "");
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "");

    const fullNameValidation = validateFullName(fullName);
    const roleValidation = validateRole(role);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setFullNameError(fullNameValidation);
    setRoleError(roleValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setRegistrationError("");

    if (
      fullNameValidation ||
      roleValidation ||
      emailValidation ||
      passwordValidation
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        name: fullName,
        password,
        role,
      });

      if (error) {
        setRegistrationError(getRegistrationErrorMessage(error));
        return;
      }

      if (data) {
        onSuccess?.();
        router.push(redirectTo ?? `/dashboard/${role.toLowerCase()}`);
        router.refresh();
      } else {
        setRegistrationError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      setRegistrationError(getRegistrationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Register via email
      </h2>

      {registrationError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {registrationError}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={roleError ? true : undefined}>
            <FieldLabel htmlFor="registration-role">Account type</FieldLabel>
            <select
              id="registration-role"
              name="role"
              defaultValue="buyer"
              onChange={(event) => {
                setRegistrationError("");
                if (roleError) {
                  setRoleError(validateRole(event.currentTarget.value));
                }
              }}
              aria-invalid={roleError ? true : undefined}
              aria-describedby={roleError ? "registration-role-error" : undefined}
              className="border-input focus-visible:ring-ring dark:bg-input/30 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            {roleError && (
              <FieldDescription
                id="registration-role-error"
                role="alert"
                className="text-destructive text-red-600"
              >
                {roleError}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={fullNameError ? true : undefined}>
            <FieldLabel htmlFor="registration-name">Full name</FieldLabel>
            <Input
              id="registration-name"
              name="fullName"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              onChange={(event) => {
                setRegistrationError("");
                if (fullNameError) {
                  setFullNameError(validateFullName(event.currentTarget.value));
                }
              }}
              onBlur={(event) =>
                setFullNameError(validateFullName(event.currentTarget.value))
              }
              aria-invalid={fullNameError ? true : undefined}
              aria-describedby={
                fullNameError ? "registration-name-error" : undefined
              }
            />
            {fullNameError && (
              <FieldDescription
                id="registration-name-error"
                role="alert"
                className="text-destructive text-red-600"
              >
                {fullNameError}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={emailError ? true : undefined}>
            <FieldLabel htmlFor="registration-email">Email</FieldLabel>
            <Input
              id="registration-email"
              name="email"
              type="email"
              placeholder="name@markro.com"
              autoComplete="email"
              onChange={(event) => {
                setRegistrationError("");
                if (emailError) {
                  setEmailError(validateEmail(event.currentTarget.value));
                }
              }}
              onBlur={(event) =>
                setEmailError(validateEmail(event.currentTarget.value))
              }
              aria-invalid={emailError ? true : undefined}
              aria-describedby={
                emailError ? "registration-email-error" : undefined
              }
            />
            {emailError && (
              <FieldDescription
                id="registration-email-error"
                role="alert"
                className="text-destructive text-red-600"
              >
                {emailError}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={passwordError ? true : undefined}>
            <FieldLabel htmlFor="registration-password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="registration-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
                onChange={(event) => {
                  setRegistrationError("");
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
                  passwordError ? "registration-password-error" : undefined
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
                id="registration-password-error"
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
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="text-primary font-medium hover:underline focus-visible:underline focus-visible:outline-none hover:cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Registration;
