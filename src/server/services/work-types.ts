import { prisma } from "@/lib/prisma";
import type { WorkCategory, Priority, LeaveKind } from "@/lib/types";

export function listWorkTypes(options?: { activeOnly?: boolean }) {
  return prisma.workType.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    include: { requiredSkill: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export interface WorkTypeInput {
  name: string;
  category: WorkCategory;
  description?: string | null;
  active?: boolean;
  priority?: Priority;
  targetStaffing?: number | null;
  requiredSkillId?: string | null;
  leaveKind?: LeaveKind | null;
}

export function createWorkType(data: WorkTypeInput) {
  return prisma.workType.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description || null,
      active: data.active ?? true,
      priority: data.priority ?? "NORMAL",
      targetStaffing: data.targetStaffing ?? null,
      requiredSkillId: data.requiredSkillId || null,
      leaveKind: data.leaveKind || null,
    },
  });
}

export function updateWorkType(id: string, data: Partial<WorkTypeInput>) {
  return prisma.workType.update({ where: { id }, data });
}

export function deleteWorkType(id: string) {
  return prisma.workType.delete({ where: { id } });
}

export function findOrCreateWorkTypeByName(name: string, category: WorkCategory = "ADMINISTRATION") {
  return prisma.workType.upsert({
    where: { name },
    update: {},
    create: { name, category },
  });
}
