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
import { setEmployeeSkillsAction } from "./actions";

export function EmployeeSkillsDialog({
  open,
  onOpenChange,
  employee,
  skills,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: { id: string; name: string; skillIds: string[] } | null;
  skills: { id: string; name: string; active: boolean }[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(employee?.skillIds ?? []));
  const [isPending, startTransition] = useTransition();

  function toggle(skillId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  }

  function handleSave() {
    if (!employee) return;
    startTransition(async () => {
      await setEmployeeSkillsAction(employee.id, Array.from(selected));
      onOpenChange(false);
    });
  }

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit skills — {employee.name}</DialogTitle>
          <DialogDescription>Select every skill this employee is qualified for.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {skills.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
                className="h-4 w-4 rounded border-input"
              />
              {s.name}
              {!s.active && <span className="text-xs text-muted-foreground">(inactive)</span>}
            </label>
          ))}
          {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills defined yet.</p>}
        </div>
        <DialogFooter>
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
