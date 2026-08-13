"use client";

import { useState, useTransition, useMemo } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PEOPLESYNC_FIELDS, IGNORE_VALUE, guessFieldForHeader, type PeopleSyncField } from "@/lib/import-fields";
import { normalizeRow, validateRow, type NormalizedRow, type RowStatus } from "@/lib/import-validation";
import { importRowsAction } from "./actions";
import type { ImportSummary } from "@/server/services/import";

type Stage = "upload" | "map" | "review" | "done";
type Mapping = Record<number, PeopleSyncField | typeof IGNORE_VALUE>;

export function ImportWizard() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const results = useMemo(() => {
    if (rawRows.length === 0) return [];
    return rawRows.map((raw, i) => {
      const normalized = normalizeRow(raw, headers, mapping, i + 2); // +2: header row + 1-index
      const result = validateRow(normalized);
      return { normalized, ...result };
    });
  }, [rawRows, headers, mapping]);

  const counts = useMemo(() => {
    const c = { valid: 0, warning: 0, error: 0 };
    for (const r of results) c[r.status]++;
    return c;
  }, [results]);

  async function handleFile(file: File) {
    setParseError(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("No sheets found in this file.");
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
      if (data.length === 0) throw new Error("This file appears to be empty.");

      const headerRow = (data[0] as unknown[]).map((h) => String(h ?? "").trim());
      const dataRows = data
        .slice(1)
        .filter((row) => (row as unknown[]).some((cell) => cell !== "" && cell !== null && cell !== undefined));

      if (dataRows.length === 0) throw new Error("No data rows found below the header row.");

      const initialMapping: Mapping = {};
      headerRow.forEach((h, i) => {
        initialMapping[i] = guessFieldForHeader(h);
      });

      setFileName(file.name);
      setHeaders(headerRow);
      setRawRows(dataRows as unknown[][]);
      setMapping(initialMapping);
      setStage("map");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Could not read this file.");
    }
  }

  function goToReview() {
    const defaultSelected = new Set<number>();
    results.forEach((r, i) => {
      if (r.status !== "error") defaultSelected.add(i);
    });
    setSelectedRows(defaultSelected);
    setStage("review");
  }

  function handleImport() {
    const rowsToImport = results
      .filter((r, i) => r.status !== "error" && selectedRows.has(i))
      .map((r) => r.normalized);
    startTransition(async () => {
      const result = await importRowsAction(rowsToImport);
      setSummary(result);
      setStage("done");
    });
  }

  function reset() {
    setStage("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setSummary(null);
    setSelectedRows(new Set());
    setParseError(null);
  }

  const requiredFieldsMapped = PEOPLESYNC_FIELDS.filter((f) => f.required).every((f) =>
    Object.values(mapping).includes(f.field)
  );

  return (
    <div className="flex flex-col gap-5">
      <Steps stage={stage} />

      {stage === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>1. Upload</CardTitle>
            <CardDescription>Select an Excel (.xlsx, .xls) or CSV file containing employee and roster data.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-primary hover:bg-primary/5">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Click to choose a file</span>
              <span className="text-xs text-muted-foreground">.xlsx, .xls or .csv</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            {parseError && <p className="mt-3 text-sm font-medium text-destructive">{parseError}</p>}
          </CardContent>
        </Card>
      )}

      {stage === "map" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" /> 2. Preview and map — {fileName}
            </CardTitle>
            <CardDescription>{rawRows.length} data rows detected. Map each spreadsheet column to a PeopleSync field.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/60">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="min-w-[10rem] border-b border-border p-2 text-left align-top">
                        <p className="mb-1 font-semibold text-foreground">{h || `Column ${i + 1}`}</p>
                        <Select
                          value={mapping[i] ?? IGNORE_VALUE}
                          onChange={(e) => setMapping((m) => ({ ...m, [i]: e.target.value as PeopleSyncField | typeof IGNORE_VALUE }))}
                          className="h-8 text-xs"
                        >
                          <option value={IGNORE_VALUE}>Ignore this column</option>
                          {PEOPLESYNC_FIELDS.map((f) => (
                            <option key={f.field} value={f.field}>
                              {f.label}
                              {f.required ? " *" : ""}
                            </option>
                          ))}
                        </Select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0, 5).map((row, ri) => (
                    <tr key={ri} className="border-b border-border last:border-0">
                      {headers.map((_, ci) => (
                        <td key={ci} className="p-2 text-muted-foreground">
                          {String(row[ci] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!requiredFieldsMapped && (
              <p className="text-xs font-medium text-warning">
                Map the required field{PEOPLESYNC_FIELDS.filter((f) => f.required).length > 1 ? "s" : ""} (
                {PEOPLESYNC_FIELDS.filter((f) => f.required)
                  .map((f) => f.label)
                  .join(", ")}
                ) before continuing.
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={reset}>
                <ArrowLeft className="h-3.5 w-3.5" /> Start over
              </Button>
              <Button onClick={goToReview} disabled={!requiredFieldsMapped}>
                Continue to validation <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>3. Validate and import</CardTitle>
            <CardDescription>Every row is shown below — nothing is imported or discarded silently.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-success/30 text-success">
                <CheckCircle2 className="mr-1 h-3 w-3" /> {counts.valid} valid
              </Badge>
              <Badge variant="outline" className="border-warning/40 text-warning">
                <AlertTriangle className="mr-1 h-3 w-3" /> {counts.warning} warnings
              </Badge>
              <Badge variant="outline" className="border-destructive/40 text-destructive">
                <XCircle className="mr-1 h-3 w-3" /> {counts.error} errors
              </Badge>
            </div>

            <ReviewTable results={results} selectedRows={selectedRows} setSelectedRows={setSelectedRows} />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStage("map")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to mapping
              </Button>
              <Button onClick={handleImport} disabled={isPending || selectedRows.size === 0}>
                {isPending ? "Importing..." : `Import ${selectedRows.size} row${selectedRows.size === 1 ? "" : "s"}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === "done" && summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" /> Import complete
            </CardTitle>
            <CardDescription>{summary.rowsProcessed} rows processed from {fileName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="Employees created" value={summary.employeesCreated} />
              <SummaryStat label="Employees updated" value={summary.employeesUpdated} />
              <SummaryStat label="Teams created" value={summary.teamsCreated} />
              <SummaryStat label="Skills linked" value={summary.skillsLinked} />
              <SummaryStat label="Shifts created" value={summary.shiftsCreated} />
              <SummaryStat label="Shifts updated" value={summary.shiftsUpdated} />
              <SummaryStat label="Allocations created" value={summary.allocationsCreated} />
            </div>
            <div>
              <Button onClick={reset}>Import another file</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Steps({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string }[] = [
    { key: "upload", label: "1. Upload" },
    { key: "map", label: "2. Preview & map" },
    { key: "review", label: "3. Validate & import" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === stage);
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className={
              i <= activeIndex || stage === "done"
                ? "rounded-full bg-primary px-2.5 py-1 text-primary-foreground"
                : "rounded-full bg-muted px-2.5 py-1"
            }
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-border">—</span>}
        </div>
      ))}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ReviewTable({
  results,
  selectedRows,
  setSelectedRows,
}: {
  results: { normalized: NormalizedRow; status: RowStatus; messages: string[] }[];
  selectedRows: Set<number>;
  setSelectedRows: (updater: (prev: Set<number>) => Set<number>) => void;
}) {
  function toggle(i: number) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Row</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Work type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r, i) => (
          <TableRow key={i}>
            <TableCell>
              <input
                type="checkbox"
                disabled={r.status === "error"}
                checked={selectedRows.has(i)}
                onChange={() => toggle(i)}
                className="h-4 w-4 rounded border-input disabled:opacity-40"
              />
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{r.normalized.rowNumber}</TableCell>
            <TableCell className="font-medium text-foreground">
              {r.normalized.employeeName || r.normalized.employeeCode || "—"}
            </TableCell>
            <TableCell className="text-xs">{r.normalized.date ?? r.normalized.dateRaw ?? "—"}</TableCell>
            <TableCell className="text-xs">{r.normalized.workType || r.normalized.leaveType || "—"}</TableCell>
            <TableCell>
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell className="max-w-[20rem] text-xs text-muted-foreground">
              {r.messages.length > 0 ? r.messages.join(" ") : "Looks good."}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === "valid")
    return (
      <Badge variant="outline" className="border-success/30 text-success">
        Valid
      </Badge>
    );
  if (status === "warning")
    return (
      <Badge variant="outline" className="border-warning/40 text-warning">
        Warning
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-destructive/40 text-destructive">
      Error
    </Badge>
  );
}
