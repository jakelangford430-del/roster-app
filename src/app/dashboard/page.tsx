import Link from "next/link";
import { getScheduleForDate } from "@/server/services/schedule";
import { computeWorkforceStats } from "@/server/services/workforce-stats";
import { getBriefingForDate } from "@/server/services/briefings";
import { listActiveAnnouncements } from "@/server/services/announcements";
import { parseDateParam, formatDateISO, formatDateLong } from "@/lib/utils";
import { DateNav } from "@/components/domain/date-nav";
import { StatTile } from "@/components/domain/stat-tile";
import { AnnouncementPriorityBadge } from "@/components/domain/category-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORY_META } from "@/lib/constants";
import type { WorkCategory, AnnouncementPriority } from "@/lib/types";
import {
  Users,
  UserCheck,
  UserX,
  Palmtree,
  Stethoscope,
  GraduationCap,
  Users2,
  AlertCircle,
  Gauge,
  TrendingDown,
  Megaphone,
} from "lucide-react";

export default async function DashboardPage({ searchParams }: { searchParams: { date?: string } }) {
  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);

  const [employees, briefing, announcements] = await Promise.all([
    getScheduleForDate(date),
    getBriefingForDate(date),
    listActiveAnnouncements(date),
  ]);

  const stats = computeWorkforceStats(employees);
  const categoryEntries = (Object.entries(stats.byCategory) as [WorkCategory, number][])
    .filter(([, hours]) => hours > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCategoryHours = Math.max(1, ...categoryEntries.map(([, h]) => h));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Leadership Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)}</p>
        </div>
        <DateNav date={dateISO} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Total rostered" value={stats.totalRostered} sublabel={`of ${stats.totalEmployees} active employees`} icon={Users} />
        <StatTile label="Available" value={stats.available} icon={UserCheck} tone="success" />
        <StatTile label="Unavailable" value={stats.unavailable} icon={UserX} tone="warning" />
        <StatTile label="Unallocated" value={stats.unallocated} sublabel="gaps in today's coverage" icon={AlertCircle} tone={stats.unallocated > 0 ? "destructive" : "default"} />
        <StatTile label="Annual leave" value={stats.onAnnualLeave} icon={Palmtree} />
        <StatTile label="Sick leave" value={stats.onSickLeave} icon={Stethoscope} />
        <StatTile label="In training" value={stats.inTraining} icon={GraduationCap} />
        <StatTile label="In meetings" value={stats.inMeetings} icon={Users2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Allocation by work type category</CardTitle>
            <CardDescription>Rostered hours today, grouped by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No allocations recorded for this date yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {categoryEntries.map(([category, hours]) => {
                  const meta = CATEGORY_META[category];
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs font-medium text-foreground">{meta.label}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${meta.bar}`}
                          style={{ width: `${Math.max(4, (hours / maxCategoryHours) * 100)}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" /> Capacity & shrinkage
            </CardTitle>
            <CardDescription>
              <Link href={`/capacity?date=${dateISO}`} className="text-primary hover:underline">
                Open full calculator →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <SummaryRow label="Total rostered hours" value={`${stats.totalRosteredHours.toFixed(1)}h`} />
            <SummaryRow label="Shrinkage hours" value={`${stats.shrinkageHours.toFixed(1)}h`} />
            <SummaryRow
              label="Shrinkage %"
              value={`${stats.shrinkagePercent.toFixed(1)}%`}
              icon={<TrendingDown className="h-3.5 w-3.5 text-warning" />}
            />
            <SummaryRow label="Productive hours" value={`${stats.productiveHours.toFixed(1)}h`} />
            <SummaryRow label="Productive capacity" value={`≈ ${stats.productiveEmployeeEquivalent.toFixed(1)} FTE`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s briefing</CardTitle>
            <CardDescription>
              <Link href={`/announcements?date=${dateISO}`} className="text-primary hover:underline">
                Edit briefing →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {briefing ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">{briefing.heading}</p>
                <p className="text-sm text-muted-foreground">{briefing.message}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No briefing has been written for this date yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Active announcements
            </CardTitle>
            <CardDescription>
              <Link href="/announcements" className="text-primary hover:underline">
                Manage announcements →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active announcements for this date.</p>
            ) : (
              announcements.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <AnnouncementPriorityBadge priority={a.priority as AnnouncementPriority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
