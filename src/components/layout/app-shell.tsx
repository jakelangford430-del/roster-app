"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Compass } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { RoleSwitcher } from "./role-switcher";
import type { Role } from "@/lib/role";

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Brand />
        <SidebarNav />
        <Tagline />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <Brand compact />
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-accent" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
            <Tagline />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-1.5 hover:bg-accent lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground lg:hidden">
              <Compass className="h-5 w-5 text-primary" />
              PeopleSync
            </Link>
          </div>
          <RoleSwitcher role={role} />
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
        <Compass className="h-5 w-5 text-primary" />
        PeopleSync
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2 px-5 pb-2 pt-5">
      <Compass className="h-6 w-6 text-primary" />
      <div>
        <p className="text-base font-bold leading-tight text-foreground">PeopleSync</p>
        <p className="text-[11px] leading-tight text-muted-foreground">Workforce coordination</p>
      </div>
    </div>
  );
}

function Tagline() {
  return (
    <div className="border-t border-border px-5 py-3">
      <p className="text-[11px] leading-snug text-muted-foreground">
        Right person. Right work. Right time. <span className="font-medium text-foreground">Clear every day.</span>
      </p>
    </div>
  );
}
