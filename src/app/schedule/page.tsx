import Link from "next/link";
import { getScheduleForDate } from "@/server/services/schedule";
import { parseDateParam, formatDateISO, formatDateLong, formatTime } from "@/lib/utils";
import { DateNav } from "@/components/domain/date-nav";
import { CategoryBadge } from "@/components/domain/category-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { WorkCategory } from "@/lib/types";

export default async function SchedulePage({ searchParams }: { searchParams: { date?: string } }) {
  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);
  const employees = await getScheduleForDate(date);

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
          <h1 className="text-xl font-bold text-foreground">Team Schedule</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)} — read-only view, grouped by team</p>
        </div>
        <DateNav date={dateISO} />
      </div>

      {Array.from(byTeam.entries()).map(([teamName, teamEmployees]) => (
        <Card key={teamName}>
          <CardHeader>
            <CardTitle>{teamName}</CardTitle>
            <CardDescription>{teamEmployees.length} employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Allocations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">
                      <Link href={`/my-day?employee=${emp.id}&date=${dateISO}`} className="hover:underline">
                        {emp.name}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{emp.leader?.name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {emp.shift ? `${formatTime(emp.shift.startTime)} – ${formatTime(emp.shift.endTime)}` : "Not rostered"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {(emp.shift?.allocations ?? []).map((a) => (
                          <span
                            key={a.id}
                            title={`${formatTime(a.startTime)} – ${formatTime(a.endTime)}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-xs text-foreground"
                          >
                            <CategoryBadge category={a.workType.category as WorkCategory} />
                            {a.workType.name}
                          </span>
                        ))}
                        {emp.shift && emp.shift.allocations.length === 0 && (
                          <span className="text-xs text-muted-foreground">No allocations yet</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {employees.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active employees yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
