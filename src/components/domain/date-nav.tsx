"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  function shift(days: number) {
    const d = new Date(`${date}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    goTo(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous day">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Input
        type="date"
        value={date}
        onChange={(e) => e.target.value && goTo(e.target.value)}
        className="w-[9.5rem]"
      />
      <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next day">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(new Date().toISOString().slice(0, 10))}
      >
        Today
      </Button>
    </div>
  );
}
