import { prisma } from "@/lib/prisma";

export function listTeams() {
  return prisma.team.findMany({
    include: { leader: true, employees: { where: { active: true } } },
    orderBy: { name: "asc" },
  });
}

export function createTeam(data: { name: string; leaderId?: string | null }) {
  return prisma.team.create({ data: { name: data.name, leaderId: data.leaderId || null } });
}

export function updateTeam(id: string, data: { name?: string; leaderId?: string | null }) {
  return prisma.team.update({ where: { id }, data });
}

export function deleteTeam(id: string) {
  return prisma.team.delete({ where: { id } });
}

export function findOrCreateTeamByName(name: string) {
  return prisma.team.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}
