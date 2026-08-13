import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Info, Compass, Puzzle } from "lucide-react";

export default async function SettingsPage() {
  const [employeeCount, teamCount, workTypeCount, skillCount] = await Promise.all([
    prisma.employee.count({ where: { active: true } }),
    prisma.team.count(),
    prisma.workType.count(),
    prisma.skill.count(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">About this workspace and how data is stored.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" /> About PeopleSync
          </CardTitle>
          <CardDescription>Right person. Right work. Right time. Clear every day.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          PeopleSync is a workforce coordination and daily work allocation tool. This first version is a
          self-contained MVP — all data lives in a local SQLite database and is edited directly in the app or
          imported from Excel / CSV. There are no external system connections yet.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Data snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Active employees" value={employeeCount} />
          <Stat label="Teams" value={teamCount} />
          <Stat label="Work types" value={workTypeCount} />
          <Stat label="Skills" value={skillCount} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Employee / Leader view
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the switcher in the top-right corner to preview PeopleSync as an <strong className="text-foreground">Employee</strong>{" "}
          (My Day, announcements) or a <strong className="text-foreground">Leader</strong> (dashboard, allocation board,
          administration). This is a simple demo switcher — full sign-in and role-based permissions are planned for a
          later phase.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-primary" /> Built for future integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Every employee, shift and allocation record carries a <code className="rounded bg-muted px-1 py-0.5 text-xs">source</code>{" "}
          field ("manual", "import", or a future integration key). Later phases can sync data in from Zendesk,
          Salesforce, Slack, Microsoft Teams or a forecasting engine without changing this data model.
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
