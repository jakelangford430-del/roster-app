"use server";

import { revalidatePath } from "next/cache";
import * as briefingService from "@/server/services/briefings";
import * as announcementService from "@/server/services/announcements";
import type { AnnouncementInput } from "@/server/services/announcements";

export async function saveBriefingAction(input: {
  date: string;
  heading: string;
  message: string;
  priorities?: string;
  risks?: string;
  operationalNotes?: string;
}) {
  await briefingService.upsertBriefing({
    date: new Date(`${input.date}T00:00:00.000Z`),
    heading: input.heading,
    message: input.message,
    priorities: input.priorities,
    risks: input.risks,
    operationalNotes: input.operationalNotes,
  });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
}

export async function createAnnouncementAction(input: {
  title: string;
  message: string;
  date: string;
  priority: AnnouncementInput["priority"];
  expiryDate?: string | null;
}) {
  await announcementService.createAnnouncement({
    title: input.title,
    message: input.message,
    date: new Date(`${input.date}T00:00:00.000Z`),
    priority: input.priority,
    expiryDate: input.expiryDate ? new Date(`${input.expiryDate}T00:00:00.000Z`) : null,
  });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
}

export async function updateAnnouncementAction(
  id: string,
  input: { title: string; message: string; date: string; priority: AnnouncementInput["priority"]; expiryDate?: string | null }
) {
  await announcementService.updateAnnouncement(id, {
    title: input.title,
    message: input.message,
    date: new Date(`${input.date}T00:00:00.000Z`),
    priority: input.priority,
    expiryDate: input.expiryDate ? new Date(`${input.expiryDate}T00:00:00.000Z`) : null,
  });
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
}

export async function deleteAnnouncementAction(id: string) {
  await announcementService.deleteAnnouncement(id);
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
}
