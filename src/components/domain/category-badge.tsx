import { cn } from "@/lib/utils";
import { CATEGORY_META, PRIORITY_META, ANNOUNCEMENT_PRIORITY_META, UNALLOCATED_META } from "@/lib/constants";
import type { WorkCategory, Priority, AnnouncementPriority } from "@/lib/types";

export function CategoryBadge({ category, className }: { category: WorkCategory; className?: string }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        meta.badge,
        className
      )}
    >
      {meta.tag}
    </span>
  );
}

export function UnallocatedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        UNALLOCATED_META.badge,
        className
      )}
    >
      {UNALLOCATED_META.tag}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", meta.badge, className)}>
      {meta.label}
    </span>
  );
}

export function AnnouncementPriorityBadge({
  priority,
  className,
}: {
  priority: AnnouncementPriority;
  className?: string;
}) {
  const meta = ANNOUNCEMENT_PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", meta.badge, className)}>
      {meta.label}
    </span>
  );
}
