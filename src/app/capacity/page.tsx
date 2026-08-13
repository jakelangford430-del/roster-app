import Link from "next/link";
import { getScheduleForDate } from "@/server/services/schedule";
import { computeWorkforceStats } from "@/server/services/workforce-stats";
import { parseDateParam, formatDateISO, formatDateLong } from "@/lib/utils";
import { DateNav } from "@/components/domain/date-nav";
import { StatTile } from "@/components/domain/stat-tile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gauge, TrendingDown, Zap, ArrowRight } from "lucide-react";

export default async function CapacityPage({ searchParams }: { searchParams: { date?: string } }) {
  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);

  const employees = await getScheduleForDate(date);
  const stats = computeWorkforceStats(employees);

  const rows: { label: string; hours: number; formula?: string }[] = [
    { label: "Annual leave hours", hours: stats.annualLeaveHours },
    { label: "Sick leave hours", hours: stats.sickLeaveHours },
    { label: "Other unavailable / leave hours", hours: stats.otherLeaveHours },
    { label: "Training hours", hours: stats.trainingHours },
    { label: "Meeting hours", hours: stats.meetingHours },
    { label: "Breaks", hours: stats.breakHours },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Capacity & Shrinkage</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)}</p>
        </div>
        <DateNav date={dateISO} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 text-sm text-muted-foreground">
          Figures below are <span className="font-semibold text-foreground">calculated automatically</span> from
          today&apos;s rostered shifts and allocations. To change a number, edit the underlying schedule on the{" "}
          <Link href={`/workforce?date=${dateISO}`} className="text-primary hover:underline">
            Workforce Allocation Board
          </Link>
          .
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total rostered hours" value={`${stats.totalRosteredHours.toFixed(1)}h`} icon={Gauge} />
        <StatTile label="Unavailable hours" value={`${stats.shrinkageHours.toFixed(1)}h`} icon={TrendingDown} tone="warning" />
        <StatTile label="Productive hours" value={`${stats.productiveHours.toFixed(1)}h`} icon={Zap} tone="success" />
        <StatTile label="Shrinkage" value={`${stats.shrinkagePercent.toFixed(1)}%`} icon={TrendingDown} tone={stats.shrinkagePercent > 25 ? "destructive" : "default"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unavailable hours breakdown</CardTitle>
            <CardDescription>Contributes to shrinkage: leave, training, meetings and breaks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold tabular-nums text-foreground">{r.hours.toFixed(1)}h</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="font-semibold text-foreground">Total unavailable hours</span>
              <span className="font-bold tabular-nums text-foreground">{stats.shrinkageHours.toFixed(1)}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How this is calculated</CardTitle>
            <CardDescription>Same formulas leadership would use manually</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <Formula
              title="Shrinkage"
              formula="Unavailable hours ÷ Total rostered hours × 100"
              result={`${stats.shrinkageHours.toFixed(1)}h ÷ ${stats.totalRosteredHours.toFixed(1)}h × 100 = ${stats.shrinkagePercent.toFixed(1)}%`}
            />
            <Formula
              title="Productive hours"
              formula="Total rostered hours − unavailable hours"
              result={`${stats.totalRosteredHours.toFixed(1)}h − ${stats.shrinkageHours.toFixed(1)}h = ${stats.productiveHours.toFixed(1)}h`}
            />
            <Formula
              title="Productive capacity"
              formula="Productive hours ÷ average shift length"
              result={`≈ ${stats.productiveEmployeeEquivalent.toFixed(1)} full-time-equivalent employees available for productive work`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Workforce capacity</CardTitle>
            <CardDescription>Available productive employees vs. total rostered</CardDescription>
          </div>
          <Link href={`/dashboard?date=${dateISO}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success"
              style={{
                width: `${stats.totalRosteredHours > 0 ? (stats.productiveHours / stats.totalRosteredHours) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.productiveHours.toFixed(1)}h productive out of {stats.totalRosteredHours.toFixed(1)}h rostered (
            {stats.totalRostered} employees today)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Formula({ title, formula, result }: { title: string; formula: string; result: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{formula}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{result}</p>
    </div>
  );
}
