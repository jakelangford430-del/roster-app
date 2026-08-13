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
import { createEmployeeAction, updateEmployeeAction, deleteEmployeeAction } from "./actions";

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string | null;
  employeeCode: string | null;
  teamId: string | null;
  leaderId: string | null;
  isLeader: boolean;
  active: boolean;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  teams,
  leaders,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: { id: string; name: string }[];
  leaders: { id: string; name: string }[];
  initial?: EmployeeRecord;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [employeeCode, setEmployeeCode] = useState(initial?.employeeCode ?? "");
  const [teamId, setTeamId] = useState(initial?.teamId ?? teams[0]?.id ?? "");
  const [leaderId, setLeaderId] = useState(initial?.leaderId ?? "");
  const [isLeader, setIsLeader] = useState(initial?.isLeader ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
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
      email: email.trim() || null,
      employeeCode: employeeCode.trim() || null,
      teamId: teamId || null,
      leaderId: leaderId || null,
      isLeader,
      active,
    };
    startTransition(async () => {
      if (initial) {
        await updateEmployeeAction(initial.id, input);
      } else {
        await createEmployeeAction(input);
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteEmployeeAction(initial.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>Employee identity and reporting line.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-name">Full name</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-email">Email</Label>
              <Input id="emp-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-code">Employee ID</Label>
              <Input id="emp-code" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-team">Team</Label>
              <Select id="emp-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-leader">Leader</Label>
              <Select id="emp-leader" value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
                <option value="">No leader</option>
                {leaders
                  .filter((l) => l.id !== initial?.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isLeader} onChange={(e) => setIsLeader(e.target.checked)} className="h-4 w-4 rounded border-input" />
              Is a leader
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
              Active
            </label>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          {initial && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Delete employee
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
