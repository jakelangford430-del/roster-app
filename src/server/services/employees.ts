import { prisma } from "@/lib/prisma";

export function listEmployees(options?: { activeOnly?: boolean }) {
  return prisma.employee.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    include: { team: true, leader: true, skills: { include: { skill: true } } },
    orderBy: { name: "asc" },
  });
}

export function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: { team: true, leader: true, skills: { include: { skill: true } } },
  });
}

export interface EmployeeInput {
  name: string;
  email?: string | null;
  employeeCode?: string | null;
  teamId?: string | null;
  leaderId?: string | null;
  isLeader?: boolean;
  active?: boolean;
  source?: string;
}

export function createEmployee(data: EmployeeInput) {
  return prisma.employee.create({
    data: {
      name: data.name,
      email: data.email || null,
      employeeCode: data.employeeCode || null,
      teamId: data.teamId || null,
      leaderId: data.leaderId || null,
      isLeader: data.isLeader ?? false,
      active: data.active ?? true,
      source: data.source ?? "manual",
    },
  });
}

export function updateEmployee(id: string, data: Partial<EmployeeInput>) {
  return prisma.employee.update({ where: { id }, data });
}

export function deleteEmployee(id: string) {
  return prisma.employee.delete({ where: { id } });
}

export function setEmployeeSkills(employeeId: string, skillIds: string[]) {
  return prisma.$transaction([
    prisma.employeeSkill.deleteMany({ where: { employeeId } }),
    prisma.employeeSkill.createMany({
      data: skillIds.map((skillId) => ({ employeeId, skillId })),
    }),
  ]);
}

export function findEmployeeByNameOrCode(nameOrCode: string) {
  return prisma.employee.findFirst({
    where: { OR: [{ name: nameOrCode }, { employeeCode: nameOrCode }] },
  });
}
