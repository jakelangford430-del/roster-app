import type { PeopleSyncField } from "./import-fields";
import { parseDateValue, parseTimeValue, cellToText } from "./import-parse";

export interface NormalizedRow {
  rowNumber: number;
  employeeCode: string;
  employeeName: string;
  team: string;
  leader: string;
  date: string | null;
  dateRaw: string;
  shiftStart: string | null;
  shiftStartRaw: string;
  shiftFinish: string | null;
  shiftFinishRaw: string;
  workType: string;
  allocationStart: string | null;
  allocationStartRaw: string;
  allocationFinish: string | null;
  allocationFinishRaw: string;
  leaveType: string;
  skill: string;
  notes: string;
}

export type RowStatus = "valid" | "warning" | "error";

export interface RowResult {
  status: RowStatus;
  messages: string[];
}

export function normalizeRow(
  rawRow: unknown[],
  headers: string[],
  mapping: Record<number, PeopleSyncField | "__ignore__">,
  rowNumber: number
): NormalizedRow {
  const get = (field: PeopleSyncField): unknown => {
    const colIndex = Object.entries(mapping).find(([, f]) => f === field)?.[0];
    if (colIndex === undefined) return "";
    return rawRow[parseInt(colIndex, 10)];
  };

  const dateRaw = cellToText(get("date"));
  const shiftStartRaw = cellToText(get("shiftStart"));
  const shiftFinishRaw = cellToText(get("shiftFinish"));
  const allocationStartRaw = cellToText(get("allocationStart"));
  const allocationFinishRaw = cellToText(get("allocationFinish"));

  return {
    rowNumber,
    employeeCode: cellToText(get("employeeCode")),
    employeeName: cellToText(get("employeeName")),
    team: cellToText(get("team")),
    leader: cellToText(get("leader")),
    date: parseDateValue(get("date")),
    dateRaw,
    shiftStart: parseTimeValue(get("shiftStart")),
    shiftStartRaw,
    shiftFinish: parseTimeValue(get("shiftFinish")),
    shiftFinishRaw,
    workType: cellToText(get("workType")),
    allocationStart: parseTimeValue(get("allocationStart")),
    allocationStartRaw,
    allocationFinish: parseTimeValue(get("allocationFinish")),
    allocationFinishRaw,
    leaveType: cellToText(get("leaveType")),
    skill: cellToText(get("skill")),
    notes: cellToText(get("notes")),
  };
}

export function validateRow(row: NormalizedRow): RowResult {
  const messages: string[] = [];
  let status: RowStatus = "valid";

  function fail(msg: string) {
    messages.push(msg);
    status = "error";
  }
  function warn(msg: string) {
    messages.push(msg);
    if (status !== "error") status = "warning";
  }

  if (!row.employeeName && !row.employeeCode) {
    fail("Missing employee name or employee ID — cannot identify the employee.");
  }

  if (row.dateRaw && !row.date) {
    fail(`Could not understand date "${row.dateRaw}".`);
  }
  if (!row.dateRaw) {
    warn("No date — this row will only update the employee's profile, not their schedule.");
  }

  const hasShiftStart = !!row.shiftStartRaw;
  const hasShiftFinish = !!row.shiftFinishRaw;
  if (hasShiftStart !== hasShiftFinish) {
    fail("Shift start and shift finish must both be provided together.");
  } else if (hasShiftStart && hasShiftFinish) {
    if (!row.shiftStart) fail(`Could not understand shift start time "${row.shiftStartRaw}".`);
    if (!row.shiftFinish) fail(`Could not understand shift finish time "${row.shiftFinishRaw}".`);
    if (row.shiftStart && row.shiftFinish && row.shiftStart >= row.shiftFinish) {
      fail("Shift finish must be after shift start.");
    }
    if (row.shiftStart && row.shiftFinish && !row.date) {
      fail("A shift start/finish was given but the date could not be understood.");
    }
  }

  const hasAllocStart = !!row.allocationStartRaw;
  const hasAllocFinish = !!row.allocationFinishRaw;
  if (row.workType && (!hasAllocStart || !hasAllocFinish)) {
    warn(`Work type "${row.workType}" has no allocation start/finish — it will be added without a fixed time block.`);
  }
  if (hasAllocStart !== hasAllocFinish) {
    fail("Allocation start and allocation finish must both be provided together.");
  } else if (hasAllocStart && hasAllocFinish) {
    if (!row.allocationStart) fail(`Could not understand allocation start time "${row.allocationStartRaw}".`);
    if (!row.allocationFinish) fail(`Could not understand allocation finish time "${row.allocationFinishRaw}".`);
    if (row.allocationStart && row.allocationFinish && row.allocationStart >= row.allocationFinish) {
      fail("Allocation finish must be after allocation start.");
    }
    if (!row.workType) {
      warn("Allocation time given without a work type — it will be skipped.");
    }
  }

  if (row.leaveType && !["ANNUAL", "SICK", "OTHER"].includes(row.leaveType.trim().toUpperCase())) {
    warn(`Leave type "${row.leaveType}" not recognised — will be imported as "Other".`);
  }

  return { status, messages };
}
