"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillGapTag } from "@/components/domain/timeline";
import { CATEGORY_META } from "@/lib/constants";
import type { WorkCategory } from "@/lib/types";
import { addAllocationAction, updateAllocationAction, deleteAllocationAction } from "@/app/workforce/actions";

export interface WorkTypeOption {
  id: string;
  name: string;
  category: string;
  requiredSkillId: string | null;
  requiredSkillName: string | null;
}

interface AllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  shiftId: string;
  employeeId: string;
  employeeSkillIds: Set<string>;
  workTypes: WorkTypeOption[];
  initial?: {
    id: string;
    workTypeId: string;
    startTime: string;
    endTime: string;
    channel: string | null;
  };
  defaultStart?: string;
  defaultEnd?: string;
}

export function AllocationDialog(props: AllocationDialogProps) {
  const { open, onOpenChange, mode, shiftId, employeeId, employeeSkillIds, workTypes, initial } = props;
  const [workTypeId, setWorkTypeId] = useState(initial?.workTypeId ?? workTypes[0]?.id ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? props.defaultStart ?? "09:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? props.defaultEnd ?? "10:00");
  const [channel, setChannel] = useState(initial?.channel ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedWorkType = workTypes.find((w) => w.id === workTypeId);
  const hasSkill = selectedWorkType?.requiredSkillId
    ? employeeSkillIds.has(selectedWorkType.requiredSkillId)
    : null;

  function reset() {
    setWorkTypeId(initial?.workTypeId ?? workTypes[0]?.id ?? "");
    setStartTime(initial?.startTime ?? props.defaultStart ?? "09:00");
    setEndTime(initial?.endTime ?? props.defaultEnd ?? "10:00");
    setChannel(initial?.channel ?? "");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSave() {
    if (!workTypeId) {
      setError("Choose a work type.");
      return;
    }
    if (startTime >= endTime) {
      setError("Finish time must be after start time.");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (mode === "create") {
        await addAllocationAction({ shiftId, employeeId, workTypeId, startTime, endTime, channel });
      } else if (initial) {
        await updateAllocationAction(initial.id, { workTypeId, startTime, endTime, channel });
      }
      handleOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteAllocationAction(initial.id);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add allocation" : "Edit allocation"}</DialogTitle>
          <DialogDescription>Assign a work type and time block for this employee.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="work-type">Work type</Label>
            <Select id="work-type" value={workTypeId} onChange={(e) => setWorkTypeId(e.target.value)}>
              {workTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {wt.name} — {CATEGORY_META[wt.category as WorkCategory]?.label ?? wt.category}
                </option>
              ))}
            </Select>
            {selectedWorkType?.requiredSkillName && hasSkill !== null && (
              <SkillGapTag hasSkill={hasSkill} skillName={selectedWorkType.requiredSkillName} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start-time">Start time</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end-time">Finish time</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel">Queue / channel (optional)</Label>
            <Input
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="e.g. Billing Queue, Digital Support Chat"
            />
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          {mode === "edit" && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Remove allocation
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
