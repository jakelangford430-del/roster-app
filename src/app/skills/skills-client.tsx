"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SkillDialog } from "./skill-dialog";
import { EmployeeSkillsDialog } from "./employee-skills-dialog";

export interface SkillListItem {
  id: string;
  name: string;
  active: boolean;
  employeeCount: number;
}

export interface EmployeeSkillRow {
  id: string;
  name: string;
  teamName: string | null;
  skillIds: string[];
  skillNames: string[];
}

export function SkillsClient({
  skills,
  employees,
}: {
  skills: SkillListItem[];
  employees: EmployeeSkillRow[];
}) {
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillListItem | undefined>();
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeSkillRow | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>{skills.length} skills defined</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingSkill(undefined);
              setSkillDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add skill
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Employees qualified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell>{s.employeeCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.active ? "border-success/30 text-success" : "border-muted text-muted-foreground"}>
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingSkill(s);
                        setSkillDialogOpen(true);
                      }}
                      aria-label={`Edit ${s.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {skills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No skills yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee skills</CardTitle>
          <CardDescription>Who is qualified for what. Used to flag skill gaps on the allocation board.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                  <TableCell>{e.teamName ?? "—"}</TableCell>
                  <TableCell className="max-w-[24rem]">
                    <div className="flex flex-wrap gap-1">
                      {e.skillNames.length === 0 && <span className="text-xs text-muted-foreground">No skills recorded</span>}
                      {e.skillNames.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingEmployee(e);
                        setEmpDialogOpen(true);
                      }}
                      aria-label={`Edit skills for ${e.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SkillDialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen} initial={editingSkill} />
      <EmployeeSkillsDialog
        key={editingEmployee?.id ?? "none"}
        open={empDialogOpen}
        onOpenChange={setEmpDialogOpen}
        employee={editingEmployee}
        skills={skills}
      />
    </div>
  );
}
