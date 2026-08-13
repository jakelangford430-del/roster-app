import { listWorkTypes } from "@/server/services/work-types";
import { listSkills } from "@/server/services/skills";
import { WorkTypesClient } from "./work-types-client";
import type { WorkCategory, Priority, LeaveKind } from "@/lib/types";

export default async function WorkTypesPage() {
  const [workTypes, skills] = await Promise.all([listWorkTypes(), listSkills()]);

  const items = workTypes.map((wt) => ({
    id: wt.id,
    name: wt.name,
    category: wt.category as WorkCategory,
    description: wt.description,
    active: wt.active,
    priority: wt.priority as Priority,
    targetStaffing: wt.targetStaffing,
    requiredSkillId: wt.requiredSkillId,
    requiredSkillName: wt.requiredSkill?.name ?? null,
    leaveKind: wt.leaveKind as LeaveKind | null,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Work Types</h1>
        <p className="text-sm text-muted-foreground">Define the types of work employees can be allocated to.</p>
      </div>
      <WorkTypesClient workTypes={items} skills={skills.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}
