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
import { Label } from "@/components/ui/label";
import { createTeamAction, updateTeamAction, deleteTeamAction } from "./actions";

export function TeamDialog({
  open,
  onOpenChange,
  leaders,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaders: { id: string; name: string }[];
  initial?: { id: string; name: string; leaderId: string | null };
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [leaderId, setLeaderId] = useState(initial?.leaderId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      if (initial) {
        await updateTeamAction(initial.id, { name: name.trim(), leaderId: leaderId || null });
      } else {
        await createTeamAction({ name: name.trim(), leaderId: leaderId || null });
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteTeamAction(initial.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit team" : "Add team"}</DialogTitle>
          <DialogDescription>Teams group employees and assign a leader.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Team name</Label>
            <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Billing & Payments" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-leader">Leader</Label>
            <Select id="team-leader" value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
              <option value="">No leader assigned</option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          {initial && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Delete team
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
