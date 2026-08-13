"use server";

import { revalidatePath } from "next/cache";
import * as skillService from "@/server/services/skills";
import * as employeeService from "@/server/services/employees";

export async function createSkillAction(input: { name: string; active?: boolean }) {
  await skillService.createSkill(input);
  revalidatePath("/skills");
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}

export async function updateSkillAction(id: string, input: { name?: string; active?: boolean }) {
  await skillService.updateSkill(id, input);
  revalidatePath("/skills");
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}

export async function deleteSkillAction(id: string) {
  await skillService.deleteSkill(id);
  revalidatePath("/skills");
  revalidatePath("/work-types");
  revalidatePath("/workforce");
}

export async function setEmployeeSkillsAction(employeeId: string, skillIds: string[]) {
  await employeeService.setEmployeeSkills(employeeId, skillIds);
  revalidatePath("/skills");
  revalidatePath("/people");
  revalidatePath("/workforce");
  revalidatePath("/my-day");
}
