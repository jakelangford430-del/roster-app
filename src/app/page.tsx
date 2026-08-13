import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ROLE_COOKIE, isRole } from "@/lib/role";

export default function RootPage() {
  const cookieRole = cookies().get(ROLE_COOKIE)?.value;
  const role = isRole(cookieRole) ? cookieRole : "employee";
  redirect(role === "leader" ? "/dashboard" : "/my-day");
}
