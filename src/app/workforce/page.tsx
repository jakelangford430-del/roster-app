import { getScheduleForDate } from "@/server/services/schedule";
import { listWorkTypes } from "@/server/services/work-types";
import { parseDateParam, formatDateISO, formatDateLong } from "@/lib/utils";
import { DateNav } from "@/components/domain/date-nav";
import { WorkforceRow } from "@/components/domain/workforce-row";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORY_META, UNALLOCATED_META } from "@/lib/constants";
import type { WorkCategory } from "@/lib/types";

export default async function WorkforcePage({ searchParams }: { searchParams: { date?: string } }) {
  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);

  const [employees, workTypesRaw] = await Promise.all([
    getScheduleForDate(date),
    listWorkTypes({ activeOnly: true }),
  ]);

  const workTypes = workTypesRaw.map((wt) => ({
    id: wt.id,
    name: wt.name,
    category: wt.category,
    requiredSkillId: wt.requiredSkillId,
    requiredSkillName: wt.requiredSkill?.name ?? null,
  }));

  const byTeam = new Map<string, typeof employees>();
  for (const emp of employees) {
    const key = emp.team?.name ?? "No team";
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key)!.push(emp);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Workforce Allocation Board</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)}</p>
        </div>
        <DateNav date={dateISO} />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 pt-4 text-xs">
          <span className="font-medium text-muted-foreground">Legend:</span>
          {(Object.entries(CATEGORY_META) as [WorkCategory, (typeof CATEGORY_META)[WorkCategory]][]).map(
            ([key, meta]) => (
              <span key={key} className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-semibold ${meta.badge}`}>
                {meta.tag}
              </span>
            )
          )}
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-semibold ${UNALLOCATED_META.badge}`}>
            {UNALLOCATED_META.tag}
          </span>
        </CardContent>
      </Card>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active employees yet. Add people on the People page or import a roster.
          </CardContent>
        </Card>
      ) : (
        Array.from(byTeam.entries()).map(([teamName, teamEmployees]) => (
          <Card key={teamName}>
            <CardHeader>
              <CardTitle>{teamName}</CardTitle>
              <CardDescription>{teamEmployees.length} employees · click a block to edit, click the + to add</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                {teamEmployees.map((emp) => (
                  <WorkforceRow
                    key={emp.id}
                    date={dateISO}
                    employee={{
                      id: emp.id,
                      name: emp.name,
                      teamName: emp.team?.name ?? null,
                      skillIds: emp.skills.map((s) => s.skillId),
                    }}
                    shift={emp.shift ? { id: emp.shift.id, startTime: emp.shift.startTime, endTime: emp.shift.endTime } : null}
                    allocations={
                      emp.shift?.allocations.map((a) => ({
                        id: a.id,
                        workTypeId: a.workTypeId,
                        workTypeName: a.workType.name,
                        category: a.workType.category as WorkCategory,
                        startTime: a.startTime,
                        endTime: a.endTime,
                        channel: a.channel,
                        requiredSkillId: a.workType.requiredSkillId,
                      })) ?? []
                    }
                    workTypes={workTypes}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
