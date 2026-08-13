import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "14:30" -> "2:30 PM" */
export function formatTime(value: string): string {
  const [hStr, mStr] = value.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}

/** minutes since midnight for a "HH:mm" string */
export function toMinutes(value: string): number {
  const [h, m] = value.split(":").map((v) => parseInt(v, 10));
  return h * 60 + (m || 0);
}

export function durationHours(start: string, end: string): number {
  const diff = toMinutes(end) - toMinutes(start);
  return Math.max(0, diff) / 60;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function parseDateParam(value?: string): Date {
  if (value) {
    const d = new Date(`${value}T00:00:00.000Z`);
    if (!isNaN(d.getTime())) return d;
  }
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
