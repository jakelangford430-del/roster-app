import { cn } from "@/lib/utils";
import { formatTime, durationHours } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/constants";
import type { WorkCategory } from "@/lib/types";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export interface TimelineBlock {
  id: string;
  startTime: string;
  endTime: string;
  workTypeName: string;
  category: WorkCategory;
  channel?: string | null;
  requiredSkillName?: string | null;
  hasRequiredSkill?: boolean | null;
}

export function Timeline({
  blocks,
  nowMinutes,
}: {
  blocks: TimelineBlock[];
  /** minutes-since-midnight to highlight the current block; omit to disable "now" highlighting */
  nowMinutes?: number;
}) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No allocations scheduled yet.
      </div>
    );
  }

  const toMin = (v: string) => {
    const [h, m] = v.split(":").map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };

  return (
    <ol className="flex flex-col gap-2">
      {blocks.map((block) => {
        const meta = CATEGORY_META[block.category];
        const isNow =
          nowMinutes !== undefined && toMin(block.startTime) <= nowMinutes && nowMinutes < toMin(block.endTime);
        const isPast = nowMinutes !== undefined && toMin(block.endTime) <= nowMinutes;
        return (
          <li
            key={block.id}
            className={cn(
              "flex items-stretch gap-3 rounded-lg border p-3 transition-colors",
              isNow ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
              isPast && !isNow && "opacity-60"
            )}
          >
            <div className={cn("w-1.5 shrink-0 rounded-full", meta.bar)} />
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {formatTime(block.startTime)} – {formatTime(block.endTime)}
                  </p>
                  {isNow && (
                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                      Now
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-foreground">{block.workTypeName}</p>
                {block.channel && <p className="truncate text-xs text-muted-foreground">{block.channel}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {block.requiredSkillName && (
                  <SkillGapTag hasSkill={!!block.hasRequiredSkill} skillName={block.requiredSkillName} />
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
                    meta.badge
                  )}
                >
                  {meta.tag}
                </span>
                <span className="text-xs text-muted-foreground">
                  {durationHours(block.startTime, block.endTime).toFixed(1)}h
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function SkillGapTag({ hasSkill, skillName }: { hasSkill: boolean; skillName: string }) {
  return (
    <span
      title={skillName}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
        hasSkill
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/40 bg-warning/10 text-warning"
      )}
    >
      {hasSkill ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {hasSkill ? "Qualified" : "Skill gap"}
    </span>
  );
}
