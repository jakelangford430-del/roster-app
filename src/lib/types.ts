// SQLite has no native enum type, so these are plain String columns in Prisma
// (see prisma/schema.prisma). The allowed values are defined once here and used
// for both TypeScript typing and runtime validation at the application boundary.

export const WORK_CATEGORIES = [
  "VOICE",
  "DIGITAL",
  "CASES",
  "SUPPORT",
  "TRAINING",
  "MEETINGS",
  "LEAVE",
  "ADMINISTRATION",
  "BREAK",
  "PROJECT",
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const ANNOUNCEMENT_PRIORITIES = ["NORMAL", "IMPORTANT", "CRITICAL"] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const LEAVE_KINDS = ["ANNUAL", "SICK", "OTHER"] as const;
export type LeaveKind = (typeof LEAVE_KINDS)[number];

export function isWorkCategory(value: string): value is WorkCategory {
  return (WORK_CATEGORIES as readonly string[]).includes(value);
}

export function isPriority(value: string): value is Priority {
  return (PRIORITIES as readonly string[]).includes(value);
}

export function isAnnouncementPriority(value: string): value is AnnouncementPriority {
  return (ANNOUNCEMENT_PRIORITIES as readonly string[]).includes(value);
}

export function isLeaveKind(value: string): value is LeaveKind {
  return (LEAVE_KINDS as readonly string[]).includes(value);
}
