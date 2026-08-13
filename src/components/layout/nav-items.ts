import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sun,
  Users,
  CalendarClock,
  Contact,
  Briefcase,
  Sparkles,
  Gauge,
  Megaphone,
  UploadCloud,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Leadership overview" },
  { href: "/my-day", label: "My Day", icon: Sun, description: "Your schedule, today" },
  { href: "/workforce", label: "Workforce", icon: Users, description: "Allocation board" },
  { href: "/schedule", label: "Schedule", icon: CalendarClock, description: "Team schedule" },
  { href: "/people", label: "People", icon: Contact, description: "Employees & teams" },
  { href: "/work-types", label: "Work Types", icon: Briefcase, description: "Manage work types" },
  { href: "/skills", label: "Skills", icon: Sparkles, description: "Employee skills" },
  { href: "/capacity", label: "Capacity", icon: Gauge, description: "Shrinkage & capacity" },
  { href: "/announcements", label: "Announcements", icon: Megaphone, description: "Briefings & news" },
  { href: "/import", label: "Import Data", icon: UploadCloud, description: "Excel / CSV import" },
  { href: "/settings", label: "Settings", icon: Settings, description: "App settings" },
];
