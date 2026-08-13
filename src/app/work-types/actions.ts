"use server";

import { revalidatePath } from "next/cache";
import * as workTypeService from "@/server/services/work-types";
import type { WorkTypeInput } from "@/server/services/work-types";

export async function createWorkTypeAction(input: WorkTypeInput) {
  await workTypeService.createWorkType(input);
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}

export async function updateWorkTypeAction(id: string, input: Partial<WorkTypeInput>) {
  await workTypeService.updateWorkType(id, input);
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}

export async function deleteWorkTypeAction(id: string) {
  await workTypeService.deleteWorkType(id);
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}
