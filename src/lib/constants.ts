import type { WorkCategory, Priority, AnnouncementPriority, LeaveKind } from "@/lib/types";

/**
 * Visual + text treatment for each work category. Every category gets a short text
 * tag (never rely on colour alone) plus a colour pairing that works in light and dark.
 */
export const CATEGORY_META: Record<
  WorkCategory,
  { label: string; tag: string; badge: string; bar: string }
> = {
  VOICE: {
    label: "Voice",
    tag: "VOICE",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    bar: "bg-blue-500",
  },
  DIGITAL: {
    label: "Digital",
    tag: "DIGITAL",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
    bar: "bg-teal-500",
  },
  CASES: {
    label: "Cases",
    tag: "CASES",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    bar: "bg-purple-500",
  },
  SUPPORT: {
    label: "Support",
    tag: "SUPPORT",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
  },
  TRAINING: {
    label: "Training",
    tag: "TRAINING",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    bar: "bg-indigo-500",
  },
  MEETINGS: {
    label: "Meetings",
    tag: "MEETING",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    bar: "bg-cyan-500",
  },
  LEAVE: {
    label: "Leave",
    tag: "LEAVE",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    bar: "bg-rose-500",
  },
  ADMINISTRATION: {
    label: "Administration",
    tag: "ADMIN",
    badge: "bg-slate-200 text-slate-800 border-slate-300",
    bar: "bg-slate-500",
  },
  BREAK: {
    label: "Break",
    tag: "BREAK",
    badge: "bg-lime-100 text-lime-800 border-lime-200",
    bar: "bg-lime-500",
  },
  PROJECT: {
    label: "Project",
    tag: "PROJECT",
    badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    bar: "bg-fuchsia-500",
  },
};

export const UNALLOCATED_META = {
  label: "Unallocated",
  tag: "UNALLOCATED",
  badge: "bg-red-50 text-red-700 border-red-200 border-dashed",
  bar: "bg-red-200",
};

export const SHRINKAGE_CATEGORIES: WorkCategory[] = ["LEAVE", "TRAINING", "MEETINGS", "BREAK"];

export const PRIORITY_META: Record<Priority, { label: string; badge: string }> = {
  LOW: { label: "Low", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  NORMAL: { label: "Normal", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "High", badge: "bg-amber-100 text-amber-800 border-amber-300" },
  CRITICAL: { label: "Critical", badge: "bg-red-100 text-red-800 border-red-300" },
};

export const ANNOUNCEMENT_PRIORITY_META: Record<
  AnnouncementPriority,
  { label: string; badge: string }
> = {
  NORMAL: { label: "Normal", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  IMPORTANT: { label: "Important", badge: "bg-amber-100 text-amber-800 border-amber-300" },
  CRITICAL: { label: "Critical", badge: "bg-red-100 text-red-800 border-red-300" },
};

export const LEAVE_KIND_META: Record<LeaveKind, { label: string }> = {
  ANNUAL: { label: "Annual Leave" },
  SICK: { label: "Sick Leave" },
  OTHER: { label: "Other Leave" },
};

export const CATEGORY_OPTIONS: { value: WorkCategory; label: string }[] = Object.entries(
  CATEGORY_META
).map(([value, meta]) => ({ value: value as WorkCategory, label: meta.label }));

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = Object.entries(
  PRIORITY_META
).map(([value, meta]) => ({ value: value as Priority, label: meta.label }));

export const ANNOUNCEMENT_PRIORITY_OPTIONS: { value: AnnouncementPriority; label: string }[] =
  Object.entries(ANNOUNCEMENT_PRIORITY_META).map(([value, meta]) => ({
    value: value as AnnouncementPriority,
    label: meta.label,
  }));
