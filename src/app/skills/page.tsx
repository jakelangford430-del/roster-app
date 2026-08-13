import { listSkills } from "@/server/services/skills";
import { listEmployees } from "@/server/services/employees";
import { SkillsClient } from "./skills-client";

export default async function SkillsPage() {
  const [skills, employees] = await Promise.all([listSkills(), listEmployees({ activeOnly: true })]);

  const skillItems = skills.map((s) => ({
    id: s.id,
    name: s.name,
    active: s.active,
    employeeCount: s.employees.length,
  }));

  const employeeRows = employees.map((e) => ({
    id: e.id,
    name: e.name,
    teamName: e.team?.name ?? null,
    skillIds: e.skills.map((s) => s.skillId),
    skillNames: e.skills.map((s) => s.skill.name),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Skills</h1>
        <p className="text-sm text-muted-foreground">Manage skills and who is qualified for what.</p>
      </div>
      <SkillsClient skills={skillItems} employees={employeeRows} />
    </div>
  );
}
