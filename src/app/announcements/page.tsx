import { getBriefingForDate } from "@/server/services/briefings";
import { listAnnouncements } from "@/server/services/announcements";
import { parseDateParam, formatDateISO, formatDateLong } from "@/lib/utils";
import { DateNav } from "@/components/domain/date-nav";
import { BriefingForm } from "./briefing-form";
import { AnnouncementsClient } from "./announcements-client";
import type { AnnouncementPriority } from "@/lib/types";

export default async function AnnouncementsPage({ searchParams }: { searchParams: { date?: string } }) {
  const date = parseDateParam(searchParams.date);
  const dateISO = formatDateISO(date);

  const [briefing, announcements] = await Promise.all([getBriefingForDate(date), listAnnouncements()]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Briefing & Announcements</h1>
          <p className="text-sm text-muted-foreground">{formatDateLong(date)}</p>
        </div>
        <DateNav date={dateISO} />
      </div>

      <BriefingForm
        date={dateISO}
        initial={
          briefing
            ? {
                heading: briefing.heading,
                message: briefing.message,
                priorities: briefing.priorities,
                risks: briefing.risks,
                operationalNotes: briefing.operationalNotes,
              }
            : null
        }
      />

      <AnnouncementsClient
        defaultDate={dateISO}
        announcements={announcements.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          date: formatDateISO(a.date),
          priority: a.priority as AnnouncementPriority,
          expiryDate: a.expiryDate ? formatDateISO(a.expiryDate) : null,
        }))}
      />
    </div>
  );
}
