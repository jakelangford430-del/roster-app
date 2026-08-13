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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import type { WorkCategory, Priority, LeaveKind } from "@/lib/types";
import { createWorkTypeAction, updateWorkTypeAction, deleteWorkTypeAction } from "./actions";

export interface WorkTypeRecord {
  id: string;
  name: string;
  category: WorkCategory;
  description: string | null;
  active: boolean;
  priority: Priority;
  targetStaffing: number | null;
  requiredSkillId: string | null;
  leaveKind: LeaveKind | null;
}

export function WorkTypeDialog({
  open,
  onOpenChange,
  skills,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skills: { id: string; name: string }[];
  initial?: WorkTypeRecord;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<WorkCategory>(initial?.category ?? "VOICE");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "NORMAL");
  const [targetStaffing, setTargetStaffing] = useState(initial?.targetStaffing?.toString() ?? "");
  const [requiredSkillId, setRequiredSkillId] = useState(initial?.requiredSkillId ?? "");
  const [leaveKind, setLeaveKind] = useState<LeaveKind | "">(initial?.leaveKind ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    const input = {
      name: name.trim(),
      category,
      description: description.trim() || null,
      active,
      priority,
      targetStaffing: targetStaffing ? parseInt(targetStaffing, 10) : null,
      requiredSkillId: requiredSkillId || null,
      leaveKind: category === "LEAVE" ? leaveKind || null : null,
    };
    startTransition(async () => {
      if (initial) {
        await updateWorkTypeAction(initial.id, input);
      } else {
        await createWorkTypeAction(input);
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteWorkTypeAction(initial.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit work type" : "Add work type"}</DialogTitle>
          <DialogDescription>Define a type of work employees can be allocated to.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wt-name">Work type name</Label>
            <Input id="wt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Inbound Billing Queue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wt-category">Category</Label>
              <Select id="wt-category" value={category} onChange={(e) => setCategory(e.target.value as WorkCategory)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wt-priority">Priority</Label>
              <Select id="wt-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {category === "LEAVE" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wt-leave-kind">Leave type</Label>
              <Select id="wt-leave-kind" value={leaveKind} onChange={(e) => setLeaveKind(e.target.value as LeaveKind)}>
                <option value="">Not specified</option>
                <option value="ANNUAL">Annual leave</option>
                <option value="SICK">Sick leave</option>
                <option value="OTHER">Other leave</option>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wt-description">Description</Label>
            <Textarea id="wt-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wt-skill">Required skill</Label>
              <Select id="wt-skill" value={requiredSkillId} onChange={(e) => setRequiredSkillId(e.target.value)}>
                <option value="">None</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wt-target">Target staffing level</Label>
              <Input
                id="wt-target"
                type="number"
                min={0}
                value={targetStaffing}
                onChange={(e) => setTargetStaffing(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
            Active
          </label>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          {initial && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Delete work type
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
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
