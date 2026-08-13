"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_COOKIE, type Role } from "@/lib/role";

export function RoleSwitcher({ role }: { role: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setRole(next: Role) {
    document.cookie = `${ROLE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => {
      router.push(next === "leader" ? "/dashboard" : "/my-day");
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1 text-xs font-medium",
        isPending && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={() => setRole("employee")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors",
          role === "employee" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <UserCircle className="h-3.5 w-3.5" />
        Employee
      </button>
      <button
        type="button"
        onClick={() => setRole("leader")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors",
          role === "leader" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Users className="h-3.5 w-3.5" />
        Leader
      </button>
    </div>
  );
}
