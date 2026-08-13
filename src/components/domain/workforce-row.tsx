"use client";

import { useState } from "react";
import { Plus, AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, toMinutes } from "@/lib/utils";
import { CATEGORY_META, UNALLOCATED_META } from "@/lib/constants";
import type { WorkCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AllocationDialog, type WorkTypeOption } from "@/components/domain/allocation-dialog";
import { ShiftDialog } from "@/components/domain/shift-dialog";

export interface RowAllocation {
  id: string;
  workTypeId: string;
  workTypeName: string;
  category: WorkCategory;
  startTime: string;
  endTime: string;
  channel: string | null;
  requiredSkillId: string | null;
}

export interface WorkforceRowProps {
  employee: {
    id: string;
    name: string;
    teamName: string | null;
    skillIds: string[];
  };
  date: string;
  shift: { id: string; startTime: string; endTime: string } | null;
  allocations: RowAllocation[];
  workTypes: WorkTypeOption[];
}

export function WorkforceRow({ employee, date, shift, allocations, workTypes }: WorkforceRowProps) {
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [allocDialog, setAllocDialog] = useState<
    | { mode: "create"; defaultStart: string; defaultEnd: string }
    | { mode: "edit"; allocation: RowAllocation }
    | null
  >(null);

  const employeeSkillIds = new Set(employee.skillIds);

  if (!shift) {
    return (
      <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full shrink-0 sm:w-48">
          <p className="text-sm font-semibold text-foreground">{employee.name}</p>
          <p className="text-xs text-muted-foreground">{employee.teamName ?? "No team"}</p>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
          Not rostered today
          <Button size="sm" variant="outline" onClick={() => setShiftDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add shift
          </Button>
        </div>
        <ShiftDialog
          open={shiftDialogOpen}
          onOpenChange={setShiftDialogOpen}
          employeeId={employee.id}
          employeeName={employee.name}
          date={date}
          initialStart="09:00"
          initialEnd="17:00"
        />
      </div>
    );
  }

  const shiftStartMin = toMinutes(shift.startTime);
  const shiftEndMin = toMinutes(shift.endTime);
  const totalMin = Math.max(1, shiftEndMin - shiftStartMin);

  const sorted = [...allocations].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  // Compute gap segments (unallocated time within the shift window)
  type Segment =
    | { kind: "allocation"; alloc: RowAllocation; startMin: number; endMin: number }
    | { kind: "gap"; startMin: number; endMin: number };
  const segments: Segment[] = [];
  let cursor = shiftStartMin;
  for (const alloc of sorted) {
    const s = Math.max(shiftStartMin, toMinutes(alloc.startTime));
    const e = Math.min(shiftEndMin, toMinutes(alloc.endTime));
    if (s > cursor) segments.push({ kind: "gap", startMin: cursor, endMin: s });
    segments.push({ kind: "allocation", alloc, startMin: s, endMin: e });
    cursor = Math.max(cursor, e);
  }
  if (cursor < shiftEndMin) segments.push({ kind: "gap", startMin: cursor, endMin: shiftEndMin });

  function openCreateAt(defaultStart: string, defaultEnd: string) {
    setAllocDialog({ mode: "create", defaultStart, defaultEnd });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-full shrink-0 sm:w-48">
        <p className="text-sm font-semibold text-foreground">{employee.name}</p>
        <p className="text-xs text-muted-foreground">{employee.teamName ?? "No team"}</p>
      </div>

      <div className="w-full shrink-0 sm:w-24">
        <button
          onClick={() => setShiftDialogOpen(true)}
          className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {formatTime(shift.startTime)}
          <br className="hidden sm:block" />– {formatTime(shift.endTime)}
          <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      <div className="relative h-12 flex-1 overflow-hidden rounded-lg bg-muted">
        {segments.map((seg, i) => {
          const left = ((seg.startMin - shiftStartMin) / totalMin) * 100;
          const width = ((seg.endMin - seg.startMin) / totalMin) * 100;
          if (seg.kind === "gap") {
            return (
              <button
                key={`gap-${i}`}
                onClick={() =>
                  openCreateAt(minutesToTime(seg.startMin), minutesToTime(Math.min(seg.endMin, seg.startMin + 60)))
                }
                title="Unallocated — click to add work"
                style={{ left: `${left}%`, width: `${width}%` }}
                className={cn(
                  "absolute inset-y-0 flex items-center justify-center overflow-hidden border-r border-background/60 text-[10px] font-bold text-red-700 transition-colors hover:bg-red-100",
                  "bg-[repeating-linear-gradient(45deg,rgba(239,68,68,0.12),rgba(239,68,68,0.12)_6px,rgba(239,68,68,0.04)_6px,rgba(239,68,68,0.04)_12px)]"
                )}
              >
                {width > 8 && UNALLOCATED_META.tag}
              </button>
            );
          }
          const meta = CATEGORY_META[seg.alloc.category];
          const hasGap = seg.alloc.requiredSkillId ? !employeeSkillIds.has(seg.alloc.requiredSkillId) : false;
          return (
            <button
              key={seg.alloc.id}
              onClick={() => setAllocDialog({ mode: "edit", allocation: seg.alloc })}
              title={`${seg.alloc.workTypeName} · ${formatTime(seg.alloc.startTime)}–${formatTime(seg.alloc.endTime)}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              className={cn(
                "absolute inset-y-0 flex items-center justify-center gap-1 overflow-hidden border-r border-background/60 px-1 text-[10px] font-semibold text-white transition-opacity hover:opacity-90",
                meta.bar
              )}
            >
              {hasGap && <AlertTriangle className="h-3 w-3 shrink-0" />}
              {width > 10 && <span className="truncate">{seg.alloc.workTypeName}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 justify-end sm:w-10">
        <Button
          size="icon"
          variant="outline"
          onClick={() => openCreateAt(shift.startTime, minutesToTime(Math.min(shiftEndMin, shiftStartMin + 60)))}
          aria-label="Add allocation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        employeeId={employee.id}
        employeeName={employee.name}
        date={date}
        shiftId={shift.id}
        initialStart={shift.startTime}
        initialEnd={shift.endTime}
      />

      {allocDialog && (
        <AllocationDialog
          open
          onOpenChange={(open) => !open && setAllocDialog(null)}
          mode={allocDialog.mode}
          shiftId={shift.id}
          employeeId={employee.id}
          employeeSkillIds={employeeSkillIds}
          workTypes={workTypes}
          initial={
            allocDialog.mode === "edit"
              ? {
                  id: allocDialog.allocation.id,
                  workTypeId: allocDialog.allocation.workTypeId,
                  startTime: allocDialog.allocation.startTime,
                  endTime: allocDialog.allocation.endTime,
                  channel: allocDialog.allocation.channel,
                }
              : undefined
          }
          defaultStart={allocDialog.mode === "create" ? allocDialog.defaultStart : undefined}
          defaultEnd={allocDialog.mode === "create" ? allocDialog.defaultEnd : undefined}
        />
      )}
    </div>
  );
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
