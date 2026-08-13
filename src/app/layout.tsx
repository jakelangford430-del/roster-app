import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { ROLE_COOKIE, isRole, type Role } from "@/lib/role";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeopleSync — Workforce Coordination",
  description: "Know what you're working on today. See how the whole workforce is allocated.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieRole = cookies().get(ROLE_COOKIE)?.value;
  const role: Role = isRole(cookieRole) ? cookieRole : "employee";

  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell role={role}>{children}</AppShell>
      </body>
    </html>
  );
}
