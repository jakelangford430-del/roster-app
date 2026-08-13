"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmployeeDialog, type EmployeeRecord } from "./employee-dialog";
import { TeamDialog } from "./team-dialog";

export interface EmployeeListItem extends EmployeeRecord {
  teamName: string | null;
  leaderName: string | null;
  skillNames: string[];
}

export interface TeamListItem {
  id: string;
  name: string;
  leaderId: string | null;
  leaderName: string | null;
  employeeCount: number;
}

export function PeopleClient({
  employees,
  teams,
  leaders,
}: {
  employees: EmployeeListItem[];
  teams: TeamListItem[];
  leaders: { id: string; name: string }[];
}) {
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | undefined>();
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamListItem | undefined>();

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Teams</CardTitle>
            <CardDescription>{teams.length} teams</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingTeam(undefined);
              setTeamDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add team
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                  <TableCell>{t.leaderName ?? "—"}</TableCell>
                  <TableCell>{t.employeeCount}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingTeam(t);
                        setTeamDialogOpen(true);
                      }}
                      aria-label={`Edit ${t.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No teams yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Employees</CardTitle>
            <CardDescription>{employees.length} employees</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingEmployee(undefined);
              setEmployeeDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add employee
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-foreground">
                    {e.name}
                    {e.isLeader && <Badge className="ml-2 border-primary/30 bg-primary/10 text-primary" variant="outline">Leader</Badge>}
                  </TableCell>
                  <TableCell>{e.teamName ?? "—"}</TableCell>
                  <TableCell>{e.leaderName ?? "—"}</TableCell>
                  <TableCell className="max-w-[16rem] truncate text-xs text-muted-foreground">
                    {e.skillNames.join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={e.active ? "border-success/30 text-success" : "border-muted text-muted-foreground"}
                    >
                      {e.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingEmployee(e);
                        setEmployeeDialogOpen(true);
                      }}
                      aria-label={`Edit ${e.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No employees yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        teams={teams}
        leaders={leaders}
        initial={editingEmployee}
      />
      <TeamDialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen} leaders={leaders} initial={editingTeam} />
    </div>
  );
}
