"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnnouncementPriorityBadge } from "@/components/domain/category-badge";
import { AnnouncementDialog, type AnnouncementRecord } from "./announcement-dialog";

export function AnnouncementsClient({
  announcements,
  defaultDate,
}: {
  announcements: AnnouncementRecord[];
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRecord | undefined>();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>{announcements.length} total</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add announcement
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{a.title}</p>
                <AnnouncementPriorityBadge priority={a.priority} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                From {a.date}
                {a.expiryDate ? ` until ${a.expiryDate}` : " (no expiry)"}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditing(a);
                setOpen(true);
              }}
              aria-label={`Edit ${a.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
      <AnnouncementDialog open={open} onOpenChange={setOpen} defaultDate={defaultDate} initial={editing} />
    </Card>
  );
}
