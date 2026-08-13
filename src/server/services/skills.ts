import { prisma } from "@/lib/prisma";

export function listSkills() {
  return prisma.skill.findMany({
    include: { employees: { include: { employee: true } } },
    orderBy: { name: "asc" },
  });
}

export function createSkill(data: { name: string; active?: boolean }) {
  return prisma.skill.create({ data: { name: data.name, active: data.active ?? true } });
}

export function updateSkill(id: string, data: { name?: string; active?: boolean }) {
  return prisma.skill.update({ where: { id }, data });
}

export function deleteSkill(id: string) {
  return prisma.skill.delete({ where: { id } });
}

export function findOrCreateSkillByName(name: string) {
  return prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
}
