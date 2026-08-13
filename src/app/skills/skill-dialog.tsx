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
import { Label } from "@/components/ui/label";
import { createSkillAction, updateSkillAction, deleteSkillAction } from "./actions";

export function SkillDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { id: string; name: string; active: boolean };
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) {
      setError("Skill name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (initial) {
        await updateSkillAction(initial.id, { name: name.trim(), active });
      } else {
        await createSkillAction({ name: name.trim(), active });
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteSkillAction(initial.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit skill" : "Add skill"}</DialogTitle>
          <DialogDescription>Skills can be required by work types and assigned to employees.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skill-name">Skill name</Label>
            <Input id="skill-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Webchat" />
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
              Delete skill
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
