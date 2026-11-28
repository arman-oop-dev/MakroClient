export const USER_ROLES = ["buyer", "seller", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type SignupRole = Extract<UserRole, "buyer" | "seller">;

export const parseUserRole = (value: unknown): UserRole | null => {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "";
  return USER_ROLES.find((item) => item === role) ?? null;
};

export const parseSignupRole = (value: unknown): SignupRole => {
  const role = parseUserRole(value);
  return role === "seller" ? "seller" : "buyer";
};
