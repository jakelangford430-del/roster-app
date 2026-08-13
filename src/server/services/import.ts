import { prisma } from "@/lib/prisma";
import type { NormalizedRow } from "@/lib/import-validation";
import { toMinutes } from "@/lib/utils";
import type { LeaveKind } from "@/lib/types";

export interface ImportSummary {
  rowsProcessed: number;
  employeesCreated: number;
  employeesUpdated: number;
  teamsCreated: number;
  skillsLinked: number;
  shiftsCreated: number;
  shiftsUpdated: number;
  allocationsCreated: number;
}

async function resolveTeam(name: string, summary: ImportSummary) {
  if (!name) return null;
  const existing = await prisma.team.findUnique({ where: { name } });
  if (existing) return existing.id;
  const created = await prisma.team.create({ data: { name } });
  summary.teamsCreated++;
  return created.id;
}

async function resolveLeader(name: string) {
  if (!name) return null;
  const existing = await prisma.employee.findFirst({ where: { name } });
  if (existing) {
    if (!existing.isLeader) await prisma.employee.update({ where: { id: existing.id }, data: { isLeader: true } });
    return existing.id;
  }
  const created = await prisma.employee.create({
    data: { name, isLeader: true, source: "import" },
  });
  return created.id;
}

async function resolveEmployee(
  row: NormalizedRow,
  teamId: string | null,
  leaderId: string | null,
  summary: ImportSummary
) {
  let existing = row.employeeCode
    ? await prisma.employee.findUnique({ where: { employeeCode: row.employeeCode } })
    : null;
  if (!existing && row.employeeName) {
    existing = await prisma.employee.findFirst({ where: { name: row.employeeName } });
  }

  if (existing) {
    const data: Record<string, unknown> = {};
    if (teamId) data.teamId = teamId;
    if (leaderId) data.leaderId = leaderId;
    if (row.employeeCode && !existing.employeeCode) data.employeeCode = row.employeeCode;
    if (Object.keys(data).length > 0) {
      await prisma.employee.update({ where: { id: existing.id }, data });
      summary.employeesUpdated++;
    }
    return existing.id;
  }

  const created = await prisma.employee.create({
    data: {
      name: row.employeeName || row.employeeCode,
      employeeCode: row.employeeCode || null,
      teamId,
      leaderId,
      source: "import",
    },
  });
  summary.employeesCreated++;
  return created.id;
}

async function resolveSkill(name: string, employeeId: string, summary: ImportSummary) {
  if (!name) return;
  const skill = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  const existingLink = await prisma.employeeSkill.findUnique({
    where: { employeeId_skillId: { employeeId, skillId: skill.id } },
  });
  if (!existingLink) {
    await prisma.employeeSkill.create({ data: { employeeId, skillId: skill.id } });
    summary.skillsLinked++;
  }
}

async function resolveShift(
  employeeId: string,
  date: string,
  startTime: string | null,
  endTime: string | null,
  summary: ImportSummary
) {
  const dateObj = new Date(`${date}T00:00:00.000Z`);
  const existing = await prisma.shift.findUnique({ where: { employeeId_date: { employeeId, date: dateObj } } });

  if (!existing) {
    if (!startTime || !endTime) return null;
    const created = await prisma.shift.create({
      data: { employeeId, date: dateObj, startTime, endTime, source: "import" },
    });
    summary.shiftsCreated++;
    return created;
  }

  if (startTime && endTime) {
    const newStart = toMinutes(startTime) < toMinutes(existing.startTime) ? startTime : existing.startTime;
    const newEnd = toMinutes(endTime) > toMinutes(existing.endTime) ? endTime : existing.endTime;
    if (newStart !== existing.startTime || newEnd !== existing.endTime) {
      const updated = await prisma.shift.update({
        where: { id: existing.id },
        data: { startTime: newStart, endTime: newEnd },
      });
      summary.shiftsUpdated++;
      return updated;
    }
  }
  return existing;
}

const LEAVE_WORK_TYPE_NAMES: Record<LeaveKind, string> = {
  ANNUAL: "Annual Leave",
  SICK: "Sick Leave",
  OTHER: "Other Leave",
};

async function resolveLeaveWorkType(leaveType: string) {
  const normalized = leaveType.trim().toUpperCase();
  const kind: LeaveKind = normalized === "ANNUAL" || normalized === "SICK" ? (normalized as LeaveKind) : "OTHER";
  const name = LEAVE_WORK_TYPE_NAMES[kind];
  return prisma.workType.upsert({
    where: { name },
    update: {},
    create: { name, category: "LEAVE", leaveKind: kind },
  });
}

async function resolveWorkType(name: string) {
  return prisma.workType.upsert({
    where: { name },
    update: {},
    create: { name, category: "ADMINISTRATION" },
  });
}

export async function importParsedRows(rows: NormalizedRow[]): Promise<ImportSummary> {
  const summary: ImportSummary = {
    rowsProcessed: 0,
    employeesCreated: 0,
    employeesUpdated: 0,
    teamsCreated: 0,
    skillsLinked: 0,
    shiftsCreated: 0,
    shiftsUpdated: 0,
    allocationsCreated: 0,
  };

  for (const row of rows) {
    const teamId = await resolveTeam(row.team, summary);
    const leaderId = await resolveLeader(row.leader);
    const employeeId = await resolveEmployee(row, teamId, leaderId, summary);

    if (row.skill) await resolveSkill(row.skill, employeeId, summary);

    if (!row.date) {
      summary.rowsProcessed++;
      continue;
    }

    const shift = await resolveShift(employeeId, row.date, row.shiftStart, row.shiftFinish, summary);

    if (row.workType && shift) {
      const workType = await resolveWorkType(row.workType);
      const start = row.allocationStart ?? shift.startTime;
      const end = row.allocationFinish ?? shift.endTime;
      await prisma.allocation.create({
        data: {
          shiftId: shift.id,
          employeeId,
          workTypeId: workType.id,
          startTime: start,
          endTime: end,
          notes: row.notes || null,
          source: "import",
        },
      });
      summary.allocationsCreated++;
    } else if (row.leaveType && shift) {
      const workType = await resolveLeaveWorkType(row.leaveType);
      await prisma.allocation.create({
        data: {
          shiftId: shift.id,
          employeeId,
          workTypeId: workType.id,
          startTime: shift.startTime,
          endTime: shift.endTime,
          notes: row.notes || null,
          source: "import",
        },
      });
      summary.allocationsCreated++;
    }

    summary.rowsProcessed++;
  }

  return summary;
}
