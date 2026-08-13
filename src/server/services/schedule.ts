import { prisma } from "@/lib/prisma";
import { durationHours } from "@/lib/utils";

/** All employees + their shift (if rostered) + allocation blocks, for one date. */
export async function getScheduleForDate(date: Date) {
  const employees = await prisma.employee.findMany({
    where: { active: true },
    include: {
      team: true,
      leader: true,
      skills: { include: { skill: true } },
      shifts: {
        where: { date },
        include: {
          allocations: {
            include: { workType: { include: { requiredSkill: true } } },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return employees.map((emp) => ({
    ...emp,
    shift: emp.shifts[0] ?? null,
  }));
}

export async function getEmployeeDay(employeeId: string, date: Date) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      team: true,
      leader: true,
      skills: { include: { skill: true } },
      shifts: {
        where: { date },
        include: {
          allocations: {
            include: { workType: { include: { requiredSkill: true } } },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
  });
  if (!employee) return null;
  return { ...employee, shift: employee.shifts[0] ?? null };
}

export async function upsertShift(input: {
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string | null;
  source?: string;
}) {
  return prisma.shift.upsert({
    where: { employeeId_date: { employeeId: input.employeeId, date: input.date } },
    update: { startTime: input.startTime, endTime: input.endTime, notes: input.notes ?? null },
    create: {
      employeeId: input.employeeId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      notes: input.notes ?? null,
      source: input.source ?? "manual",
    },
  });
}

export async function deleteShift(shiftId: string) {
  return prisma.shift.delete({ where: { id: shiftId } });
}

export async function addAllocation(input: {
  shiftId: string;
  employeeId: string;
  workTypeId: string;
  startTime: string;
  endTime: string;
  channel?: string | null;
  notes?: string | null;
  source?: string;
}) {
  return prisma.allocation.create({
    data: {
      shiftId: input.shiftId,
      employeeId: input.employeeId,
      workTypeId: input.workTypeId,
      startTime: input.startTime,
      endTime: input.endTime,
      channel: input.channel || null,
      notes: input.notes || null,
      source: input.source ?? "manual",
    },
  });
}

export async function updateAllocation(
  id: string,
  data: Partial<{
    workTypeId: string;
    startTime: string;
    endTime: string;
    channel: string | null;
    notes: string | null;
  }>
) {
  return prisma.allocation.update({ where: { id }, data });
}

export async function deleteAllocation(id: string) {
  return prisma.allocation.delete({ where: { id } });
}

/** Duration-weighted primary/secondary allocation for an employee's day. */
export function derivePrimarySecondary<
  T extends { startTime: string; endTime: string; workType: { name: string; category: string } }
>(allocations: T[]) {
  const productive = allocations.filter((a) => a.workType.category !== "BREAK" && a.workType.category !== "LEAVE");
  const sorted = [...productive].sort(
    (a, b) => durationHours(b.startTime, b.endTime) - durationHours(a.startTime, a.endTime)
  );
  return { primary: sorted[0] ?? null, secondary: sorted[1] ?? null };
}

export function currentAndNextBlock<T extends { startTime: string; endTime: string }>(
  allocations: T[],
  nowMinutes: number
) {
  const toMin = (v: string) => {
    const [h, m] = v.split(":").map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const sorted = [...allocations].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const current = sorted.find((a) => toMin(a.startTime) <= nowMinutes && nowMinutes < toMin(a.endTime));
  const next = sorted.find((a) => toMin(a.startTime) > nowMinutes);
  return { current: current ?? null, next: next ?? null };
}
