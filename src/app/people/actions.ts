"use server";

import { revalidatePath } from "next/cache";
import * as employeeService from "@/server/services/employees";
import * as teamService from "@/server/services/teams";
import type { EmployeeInput } from "@/server/services/employees";

export async function createEmployeeAction(input: EmployeeInput) {
  await employeeService.createEmployee(input);
  revalidatePath("/people");
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
}

export async function updateEmployeeAction(id: string, input: Partial<EmployeeInput>) {
  await employeeService.updateEmployee(id, input);
  revalidatePath("/people");
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
}

export async function deleteEmployeeAction(id: string) {
  await employeeService.deleteEmployee(id);
  revalidatePath("/people");
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
}

export async function createTeamAction(input: { name: string; leaderId?: string | null }) {
  await teamService.createTeam(input);
  revalidatePath("/people");
  revalidatePath("/workforce");
}

export async function updateTeamAction(id: string, input: { name?: string; leaderId?: string | null }) {
  await teamService.updateTeam(id, input);
  revalidatePath("/people");
  revalidatePath("/workforce");
}

export async function deleteTeamAction(id: string) {
  await teamService.deleteTeam(id);
  revalidatePath("/people");
  revalidatePath("/workforce");
}
