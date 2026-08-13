"use server";

import { revalidatePath } from "next/cache";
import * as scheduleService from "@/server/services/schedule";

export async function createShiftAction(input: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  await scheduleService.upsertShift({
    employeeId: input.employeeId,
    date: new Date(`${input.date}T00:00:00.000Z`),
    startTime: input.startTime,
    endTime: input.endTime,
  });
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
}

export async function deleteShiftAction(shiftId: string) {
  await scheduleService.deleteShift(shiftId);
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
}

export async function addAllocationAction(input: {
  shiftId: string;
  employeeId: string;
  workTypeId: string;
  startTime: string;
  endTime: string;
  channel?: string;
  notes?: string;
}) {
  await scheduleService.addAllocation(input);
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
  revalidatePath("/capacity");
}

export async function updateAllocationAction(
  id: string,
  input: { workTypeId: string; startTime: string; endTime: string; channel?: string; notes?: string }
) {
  await scheduleService.updateAllocation(id, {
    workTypeId: input.workTypeId,
    startTime: input.startTime,
    endTime: input.endTime,
    channel: input.channel || null,
    notes: input.notes || null,
  });
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
  revalidatePath("/capacity");
}

export async function deleteAllocationAction(id: string) {
  await scheduleService.deleteAllocation(id);
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
  revalidatePath("/capacity");
}
