export const ROLE_COOKIE = "peoplesync_role";
export type Role = "employee" | "leader";

export function isRole(value: string | undefined): value is Role {
  return value === "employee" || value === "leader";
}
