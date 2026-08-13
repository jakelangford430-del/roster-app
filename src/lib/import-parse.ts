/** Parse a spreadsheet cell value into a "HH:mm" 24-hour time string, or null if unparseable. */
export function parseTimeValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    const h = value.getUTCHours().toString().padStart(2, "0");
    const m = value.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  if (typeof value === "number") {
    // Excel time-of-day is stored as a fraction of a 24-hour day.
    if (value >= 0 && value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      const h = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (totalMinutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    }
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const suffix = match[3]?.toUpperCase();
      if (suffix === "PM" && h < 12) h += 12;
      if (suffix === "AM" && h === 12) h = 0;
      if (h > 23 || m > 59) return null;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return null;
}

/** Parse a spreadsheet cell value into a "YYYY-MM-DD" date string, or null if unparseable. */
export function parseDateValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getUTCFullYear()}-${(value.getUTCMonth() + 1).toString().padStart(2, "0")}-${value
      .getUTCDate()
      .toString()
      .padStart(2, "0")}`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
    }

    // Prefer DD/MM/YYYY (Australian convention) over US MM/DD/YYYY.
    const slash = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (slash) {
      const day = parseInt(slash[1], 10);
      const month = parseInt(slash[2], 10);
      const year = parseInt(slash[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      }
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, "0")}-${parsed
        .getDate()
        .toString()
        .padStart(2, "0")}`;
    }
  }

  return null;
}

export function cellToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}
