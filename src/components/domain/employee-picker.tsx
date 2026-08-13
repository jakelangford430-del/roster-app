"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

export function EmployeePicker({
  employeeId,
  employees,
}: {
  employeeId: string;
  employees: { id: string; name: string; team: { name: string } | null }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("employee", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={employeeId} onChange={(e) => goTo(e.target.value)} className="w-[16rem]">
      {employees.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name}
          {e.team ? ` — ${e.team.name}` : ""}
        </option>
      ))}
    </Select>
  );
}
