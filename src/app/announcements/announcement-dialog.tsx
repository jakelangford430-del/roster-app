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
import { ANNOUNCEMENT_PRIORITY_OPTIONS } from "@/lib/constants";
import type { AnnouncementPriority } from "@/lib/types";
import { createAnnouncementAction, updateAnnouncementAction, deleteAnnouncementAction } from "./actions";

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: AnnouncementPriority;
  expiryDate: string | null;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  defaultDate,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  initial?: AnnouncementRecord;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [priority, setPriority] = useState<AnnouncementPriority>(initial?.priority ?? "NORMAL");
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setError(null);
    const input = { title: title.trim(), message: message.trim(), date, priority, expiryDate: expiryDate || null };
    startTransition(async () => {
      if (initial) {
        await updateAnnouncementAction(initial.id, input);
      } else {
        await createAnnouncementAction(input);
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      await deleteAnnouncementAction(initial.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit announcement" : "Add announcement"}</DialogTitle>
          <DialogDescription>Shown on employee dashboards while active.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ann-title">Title</Label>
            <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ann-message">Message</Label>
            <Textarea id="ann-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-date">Date</Label>
              <Input id="ann-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-expiry">Expiry date</Label>
              <Input id="ann-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-priority">Priority</Label>
              <Select id="ann-priority" value={priority} onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}>
                {ANNOUNCEMENT_PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          {initial && (
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="sm:mr-auto">
              Delete announcement
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
