"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CategoryBadge, PriorityBadge } from "@/components/domain/category-badge";
import { WorkTypeDialog, type WorkTypeRecord } from "./work-type-dialog";

export function WorkTypesClient({
  workTypes,
  skills,
}: {
  workTypes: (WorkTypeRecord & { requiredSkillName: string | null })[];
  skills: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkTypeRecord | undefined>();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Work types</CardTitle>
          <CardDescription>{workTypes.length} work types configured</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add work type
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Required skill</TableHead>
              <TableHead>Target staffing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes.map((wt) => (
              <TableRow key={wt.id}>
                <TableCell className="font-medium text-foreground">{wt.name}</TableCell>
                <TableCell>
                  <CategoryBadge category={wt.category} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={wt.priority} />
                </TableCell>
                <TableCell>{wt.requiredSkillName ?? "—"}</TableCell>
                <TableCell>{wt.targetStaffing ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={wt.active ? "border-success/30 text-success" : "border-muted text-muted-foreground"}>
                    {wt.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(wt);
                      setOpen(true);
                    }}
                    aria-label={`Edit ${wt.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {workTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  No work types yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <WorkTypeDialog open={open} onOpenChange={setOpen} skills={skills} initial={editing} />
    </Card>
  );
}
