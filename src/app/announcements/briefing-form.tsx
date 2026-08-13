"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { saveBriefingAction } from "./actions";

export interface BriefingRecord {
  heading: string;
  message: string;
  priorities: string | null;
  risks: string | null;
  operationalNotes: string | null;
}

export function BriefingForm({ date, initial }: { date: string; initial: BriefingRecord | null }) {
  const [heading, setHeading] = useState(initial?.heading ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [priorities, setPriorities] = useState(initial?.priorities ?? "");
  const [risks, setRisks] = useState(initial?.risks ?? "");
  const [operationalNotes, setOperationalNotes] = useState(initial?.operationalNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveBriefingAction({ date, heading, message, priorities, risks, operationalNotes });
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily briefing</CardTitle>
        <CardDescription>Shown to every employee when they open My Day for {date}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="briefing-heading">Heading</Label>
          <Input id="briefing-heading" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="e.g. Focus today: billing queue volume" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="briefing-message">Message</Label>
          <Textarea id="briefing-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="briefing-priorities">Priorities (one per line)</Label>
          <Textarea id="briefing-priorities" value={priorities} onChange={(e) => setPriorities(e.target.value)} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="briefing-risks">Risks (one per line)</Label>
          <Textarea id="briefing-risks" value={risks} onChange={(e) => setRisks(e.target.value)} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="briefing-notes">Operational notes</Label>
          <Textarea id="briefing-notes" value={operationalNotes} onChange={(e) => setOperationalNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending || !heading.trim() || !message.trim()}>
            {isPending ? "Saving..." : "Save briefing"}
          </Button>
          {saved && !isPending && <span className="text-xs font-medium text-success">Saved</span>}
        </div>
      </CardContent>
    </Card>
  );
}
