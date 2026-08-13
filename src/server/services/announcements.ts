import { prisma } from "@/lib/prisma";
import type { AnnouncementPriority } from "@/lib/types";

export function listAnnouncements() {
  return prisma.announcement.findMany({ orderBy: { date: "desc" } });
}

export function listActiveAnnouncements(referenceDate: Date) {
  return prisma.announcement.findMany({
    where: {
      date: { lte: referenceDate },
      OR: [{ expiryDate: null }, { expiryDate: { gte: referenceDate } }],
    },
    orderBy: [{ priority: "desc" }, { date: "desc" }],
  });
}

export interface AnnouncementInput {
  title: string;
  message: string;
  date: Date;
  priority?: AnnouncementPriority;
  expiryDate?: Date | null;
}

export function createAnnouncement(data: AnnouncementInput) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      message: data.message,
      date: data.date,
      priority: data.priority ?? "NORMAL",
      expiryDate: data.expiryDate ?? null,
    },
  });
}

export function updateAnnouncement(id: string, data: Partial<AnnouncementInput>) {
  return prisma.announcement.update({ where: { id }, data });
}

export function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({ where: { id } });
}
