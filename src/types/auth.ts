export const AUTH_ROLES = ["admin", "staff", "cliente"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export type AuthenticatedUser = {
  email: string;
  role: AuthRole;
};
