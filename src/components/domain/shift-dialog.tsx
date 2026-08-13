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
import { createShiftAction, deleteShiftAction } from "@/app/workforce/actions";

export function ShiftDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  date,
  shiftId,
  initialStart,
  initialEnd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftId?: string;
  initialStart?: string;
  initialEnd?: string;
}) {
  const [startTime, setStartTime] = useState(initialStart ?? "09:00");
  const [endTime, setEndTime] = useState(initialEnd ?? "17:00");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (startTime >= endTime) {
      setError("Finish time must be after start time.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await createShiftAction({ employeeId, date, startTime, endTime });
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!shiftId) return;
    startTransition(async () => {
      await deleteShiftAction(shiftId);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shiftId ? "Edit shift" : "Add shift"}</DialogTitle>
          <DialogDescription>{employeeName} — {date}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-start">Start time</Label>
            <Input id="shift-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-end">Finish time</Label>
            <Input id="shift-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        <DialogFooter>
          {shiftId && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Remove shift
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
