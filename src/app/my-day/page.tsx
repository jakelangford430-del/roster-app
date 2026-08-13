import { redirect } from "next/navigation";
import { listEmployees } from "@/server/services/employees";
import { getEmployeeDay, derivePrimarySecondary, currentAndNextBlock } from "@/server/services/schedule";
import { getBriefingForDate } from "@/server/services/briefings";
import { listActiveAnnouncements } from "@/server/services/announcements";
import { parseDateParam, formatDateISO, formatDateLong, formatTime } from "@/lib/utils";
import { EmployeePicker } from "@/components/domain/employee-picker";
import { DateNav } from "@/components/domain/date-nav";
import { Timeline, type TimelineBlock } from "@/components/domain/timeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnnouncementPriorityBadge } from "@/components/domain/category-badge";
import { Megaphone, Users2, Radio, Clock } from "lucide-react";
import type { WorkCategory, AnnouncementPriority } from "@/lib/types";

export default async function MyDayPage({
  searchParams,
}: {
  searchParams: { employee?: string; date?: string };
}) {
  const employees = await listEmployees({ activeOnly: true });
  if (employees.length === 0) {
    return (
      <EmptyState title="No employees yet" body="Add employees on the People page or import a roster to get started." />
    );
  }

  const employeeId = searchParams.employee && employees.some((e) => e.id === searchParams.employee)
    ? searchParams.employee
    : employees[0].id;

  if (!searchParams.employee) {
    redirect(`/my-day?employee=${employeeId}${searchParams.date ? `&date=${searchParams.date}` : ""}`);
  }

  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);

  const [day, briefing, announcements] = await Promise.all([
    getEmployeeDay(employeeId, date),
    getBriefingForDate(date),
    listActiveAnnouncements(date),
  ]);

  if (!day) {
    return <EmptyState title="Employee not found" body="Choose a different employee." />;
  }

  const allocations = day.shift?.allocations ?? [];
  const { primary, secondary } = derivePrimarySecondary(allocations);

  const now = new Date();
  const nowMinutes = dateISO === formatDateISO(now) ? now.getHours() * 60 + now.getMinutes() : undefined;
  const { current, next } = currentAndNextBlock(allocations, nowMinutes ?? -1);

  const skillIds = new Set(day.skills.map((s) => s.skillId));
  const blocks: TimelineBlock[] = allocations.map((a) => ({
    id: a.id,
    startTime: a.startTime,
    endTime: a.endTime,
    workTypeName: a.workType.name,
    category: a.workType.category as WorkCategory,
    channel: a.channel,
    requiredSkillName: a.workType.requiredSkill?.name ?? null,
    hasRequiredSkill: a.workType.requiredSkill ? skillIds.has(a.workType.requiredSkill.id) : null,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Day</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EmployeePicker employeeId={employeeId} employees={employees} />
          <DateNav date={dateISO} />
        </div>
      </div>

      {/* Right now / what's next */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Right now</p>
            {current ? (
              <>
                <p className="text-lg font-bold text-foreground">{current.workType.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(current.startTime)} – {formatTime(current.endTime)}
                  {current.channel ? ` · ${current.channel}` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {allocations.length === 0 ? "No schedule for today yet." : "Not currently in a scheduled block."}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What&apos;s next</p>
            {next ? (
              <>
                <p className="text-base font-semibold text-foreground">{next.workType.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(next.startTime)} – {formatTime(next.endTime)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing else scheduled today.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile summary */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-5 sm:grid-cols-4">
          <ProfileField label="Employee" value={day.name} />
          <ProfileField label="Team" value={day.team?.name ?? "—"} />
          <ProfileField label="Leader" value={day.leader?.name ?? "—"} />
          <ProfileField
            label="Shift"
            value={day.shift ? `${formatTime(day.shift.startTime)} – ${formatTime(day.shift.endTime)}` : "Not rostered"}
          />
          <ProfileField label="Primary allocation" value={primary?.workType.name ?? "—"} />
          <ProfileField label="Secondary allocation" value={secondary?.workType.name ?? "—"} />
          <ProfileField label="Queue / channel" value={current?.channel ?? primary?.channel ?? "—"} />
          <ProfileField label="Skills" value={day.skills.map((s) => s.skill.name).join(", ") || "—"} />
        </CardContent>
      </Card>

      {briefing && (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users2 className="h-4 w-4 text-primary" /> {briefing.heading}
              </CardTitle>
              <CardDescription>Daily briefing</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-foreground">{briefing.message}</p>
            {briefing.priorities && <BriefingList label="Priorities" text={briefing.priorities} />}
            {briefing.risks && <BriefingList label="Risks" text={briefing.risks} />}
            {briefing.operationalNotes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operational notes</p>
                <p className="text-sm text-foreground">{briefing.operationalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-primary" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <AnnouncementPriorityBadge priority={a.priority as AnnouncementPriority} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Today&apos;s schedule
          </CardTitle>
          <CardDescription>Full timeline for {day.name}, {formatDateLong(date)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline blocks={blocks} nowMinutes={nowMinutes} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BriefingList({ label, text }: { label: string; text: string }) {
  const items = text.split("\n").filter(Boolean);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="mt-1 list-inside list-disc text-sm text-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
