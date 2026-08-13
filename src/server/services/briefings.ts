import { prisma } from "@/lib/prisma";

export function getBriefingForDate(date: Date) {
  return prisma.briefing.findUnique({ where: { date } });
}

export function listBriefings() {
  return prisma.briefing.findMany({ orderBy: { date: "desc" } });
}

export function upsertBriefing(input: {
  date: Date;
  heading: string;
  message: string;
  priorities?: string | null;
  risks?: string | null;
  operationalNotes?: string | null;
}) {
  return prisma.briefing.upsert({
    where: { date: input.date },
    update: {
      heading: input.heading,
      message: input.message,
      priorities: input.priorities || null,
      risks: input.risks || null,
      operationalNotes: input.operationalNotes || null,
    },
    create: {
      date: input.date,
      heading: input.heading,
      message: input.message,
      priorities: input.priorities || null,
      risks: input.risks || null,
      operationalNotes: input.operationalNotes || null,
    },
  });
}

export function deleteBriefing(id: string) {
  return prisma.briefing.delete({ where: { id } });
}
