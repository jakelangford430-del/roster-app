import { durationHours } from "@/lib/utils";
import { SHRINKAGE_CATEGORIES } from "@/lib/constants";
import type { WorkCategory } from "@/lib/types";

type Allocation = {
  startTime: string;
  endTime: string;
  workType: { category: string; name: string; leaveKind?: string | null };
};

type ScheduleEmployee = {
  id: string;
  name: string;
  active: boolean;
  shift: { startTime: string; endTime: string; allocations: Allocation[] } | null;
};

export interface WorkforceStats {
  totalRostered: number;
  totalEmployees: number;
  available: number;
  unavailable: number;
  onAnnualLeave: number;
  onSickLeave: number;
  inTraining: number;
  inMeetings: number;
  unallocated: number;
  byCategory: Record<WorkCategory, number>;
  annualLeaveHours: number;
  sickLeaveHours: number;
  otherLeaveHours: number;
  trainingHours: number;
  meetingHours: number;
  breakHours: number;
  totalRosteredHours: number;
  shrinkageHours: number;
  shrinkagePercent: number;
  productiveHours: number;
  productiveEmployeeEquivalent: number;
}

const EMPTY_CATEGORY_COUNTS: Record<WorkCategory, number> = {
  VOICE: 0,
  DIGITAL: 0,
  CASES: 0,
  SUPPORT: 0,
  TRAINING: 0,
  MEETINGS: 0,
  LEAVE: 0,
  ADMINISTRATION: 0,
  BREAK: 0,
  PROJECT: 0,
};

/** Minutes elapsed at time-of-day; used to decide "unallocated right now" vs "unallocated at some point". */
function coversFullShift(allocations: Allocation[], shiftStart: string, shiftEnd: string): boolean {
  if (allocations.length === 0) return false;
  const toMin = (v: string) => {
    const [h, m] = v.split(":").map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const blocks = [...allocations].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  let cursor = toMin(shiftStart);
  const end = toMin(shiftEnd);
  for (const block of blocks) {
    if (toMin(block.startTime) > cursor) return false;
    cursor = Math.max(cursor, toMin(block.endTime));
  }
  return cursor >= end;
}

export function computeWorkforceStats(employees: ScheduleEmployee[]): WorkforceStats {
  const rostered = employees.filter((e) => e.shift);
  const byCategory: Record<WorkCategory, number> = { ...EMPTY_CATEGORY_COUNTS };

  let onAnnualLeave = 0;
  let onSickLeave = 0;
  let inTraining = 0;
  let inMeetings = 0;
  let unallocated = 0;
  let unavailableNow = 0;

  let totalRosteredHours = 0;
  let shrinkageHours = 0;
  let annualLeaveHours = 0;
  let sickLeaveHours = 0;
  let otherLeaveHours = 0;

  for (const emp of rostered) {
    const shift = emp.shift!;
    totalRosteredHours += durationHours(shift.startTime, shift.endTime);

    const categoriesToday = new Set<WorkCategory>();
    for (const alloc of shift.allocations) {
      const category = alloc.workType.category as WorkCategory;
      const hrs = durationHours(alloc.startTime, alloc.endTime);
      byCategory[category] += hrs;
      categoriesToday.add(category);
      if (SHRINKAGE_CATEGORIES.includes(category)) {
        shrinkageHours += hrs;
      }
      if (alloc.workType.category === "LEAVE") {
        if (alloc.workType.leaveKind === "ANNUAL") {
          onAnnualLeave++;
          annualLeaveHours += hrs;
        } else if (alloc.workType.leaveKind === "SICK") {
          onSickLeave++;
          sickLeaveHours += hrs;
        } else {
          otherLeaveHours += hrs;
        }
      }
    }
    if (categoriesToday.has("TRAINING")) inTraining++;
    if (categoriesToday.has("MEETINGS")) inMeetings++;
    if (categoriesToday.has("LEAVE")) unavailableNow++;

    if (!coversFullShift(shift.allocations, shift.startTime, shift.endTime)) {
      unallocated++;
    }
  }

  const totalRostered = rostered.length;
  const productiveHours = Math.max(0, totalRosteredHours - shrinkageHours);
  const shrinkagePercent = totalRosteredHours > 0 ? (shrinkageHours / totalRosteredHours) * 100 : 0;
  const avgShiftHours = totalRostered > 0 ? totalRosteredHours / totalRostered : 0;
  const productiveEmployeeEquivalent = avgShiftHours > 0 ? productiveHours / avgShiftHours : 0;

  return {
    totalRostered,
    totalEmployees: employees.length,
    available: totalRostered - unavailableNow,
    unavailable: unavailableNow,
    onAnnualLeave,
    onSickLeave,
    inTraining,
    inMeetings,
    unallocated,
    byCategory,
    annualLeaveHours,
    sickLeaveHours,
    otherLeaveHours,
    trainingHours: byCategory.TRAINING,
    meetingHours: byCategory.MEETINGS,
    breakHours: byCategory.BREAK,
    totalRosteredHours,
    shrinkageHours,
    shrinkagePercent,
    productiveHours,
    productiveEmployeeEquivalent,
  };
}
