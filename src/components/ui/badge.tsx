import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variant === "default" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "outline" && "border-border text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
