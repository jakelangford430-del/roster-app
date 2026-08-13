"use server";

import { revalidatePath } from "next/cache";
import { importParsedRows } from "@/server/services/import";
import type { NormalizedRow } from "@/lib/import-validation";

export async function importRowsAction(rows: NormalizedRow[]) {
  const summary = await importParsedRows(rows);
  revalidatePath("/people");
  revalidatePath("/workforce");
  revalidatePath("/dashboard");
  revalidatePath("/my-day");
  revalidatePath("/schedule");
  revalidatePath("/skills");
  revalidatePath("/work-types");
  return summary;
}
