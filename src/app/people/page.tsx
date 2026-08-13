import { listEmployees } from "@/server/services/employees";
import { listTeams } from "@/server/services/teams";
import { PeopleClient } from "./people-client";

export default async function PeoplePage() {
  const [employees, teams] = await Promise.all([listEmployees(), listTeams()]);

  const employeeListItems = employees.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    employeeCode: e.employeeCode,
    teamId: e.teamId,
    leaderId: e.leaderId,
    isLeader: e.isLeader,
    active: e.active,
    teamName: e.team?.name ?? null,
    leaderName: e.leader?.name ?? null,
    skillNames: e.skills.map((s) => s.skill.name),
  }));

  const teamListItems = teams.map((t) => ({
    id: t.id,
    name: t.name,
    leaderId: t.leaderId,
    leaderName: t.leader?.name ?? null,
    employeeCount: t.employees.length,
  }));

  const leaders = employees.filter((e) => e.isLeader).map((e) => ({ id: e.id, name: e.name }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">People</h1>
        <p className="text-sm text-muted-foreground">Manage employees, teams and reporting lines.</p>
      </div>
      <PeopleClient employees={employeeListItems} teams={teamListItems} leaders={leaders} />
    </div>
  );
}
