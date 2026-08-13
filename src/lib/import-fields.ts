export type PeopleSyncField =
  | "employeeCode"
  | "employeeName"
  | "team"
  | "leader"
  | "date"
  | "shiftStart"
  | "shiftFinish"
  | "workType"
  | "allocationStart"
  | "allocationFinish"
  | "leaveType"
  | "skill"
  | "notes";

export interface FieldDef {
  field: PeopleSyncField;
  label: string;
  required: boolean;
  hint: string;
  matches: string[];
}

export const PEOPLESYNC_FIELDS: FieldDef[] = [
  { field: "employeeName", label: "Employee Name", required: true, hint: "Full name used to match or create the employee", matches: ["employee name", "staff member", "name", "employee", "staff", "full name"] },
  { field: "employeeCode", label: "Employee ID", required: false, hint: "External employee code, if you have one", matches: ["employee id", "staff id", "id", "employee code", "emp id"] },
  { field: "team", label: "Team", required: false, hint: "Team / department name", matches: ["team", "department", "group"] },
  { field: "leader", label: "Leader", required: false, hint: "Name of this employee's leader", matches: ["leader", "manager", "supervisor", "team leader"] },
  { field: "date", label: "Date", required: false, hint: "Roster date (blank rows only update the employee profile)", matches: ["date", "roster date", "shift date"] },
  { field: "shiftStart", label: "Shift Start", required: false, hint: "e.g. 08:30 or 8:30 AM", matches: ["shift start", "start time", "shift start time", "start"] },
  { field: "shiftFinish", label: "Shift Finish", required: false, hint: "e.g. 17:00 or 5:00 PM", matches: ["shift finish", "shift end", "finish time", "end time", "finish"] },
  { field: "workType", label: "Work Type", required: false, hint: "e.g. Inbound Billing Queue, Webchat", matches: ["work type", "task", "task type", "activity", "queue"] },
  { field: "allocationStart", label: "Allocation Start", required: false, hint: "Start time of this work block", matches: ["allocation start", "block start", "task start"] },
  { field: "allocationFinish", label: "Allocation Finish", required: false, hint: "Finish time of this work block", matches: ["allocation finish", "allocation end", "block finish", "block end", "task finish", "task end"] },
  { field: "leaveType", label: "Leave Type", required: false, hint: "Annual, Sick, or Other", matches: ["leave type", "leave"] },
  { field: "skill", label: "Skill", required: false, hint: "A skill to add to this employee", matches: ["skill", "skills", "certification"] },
  { field: "notes", label: "Notes", required: false, hint: "Free-text notes", matches: ["notes", "comment", "comments"] },
];

export const IGNORE_VALUE = "__ignore__";

/** Best-guess mapping from an uploaded column header to a PeopleSync field. */
export function guessFieldForHeader(header: string): PeopleSyncField | typeof IGNORE_VALUE {
  const normalized = header.trim().toLowerCase();
  for (const def of PEOPLESYNC_FIELDS) {
    if (def.matches.includes(normalized)) return def.field;
  }
  for (const def of PEOPLESYNC_FIELDS) {
    if (def.matches.some((m) => normalized.includes(m) || m.includes(normalized))) return def.field;
  }
  return IGNORE_VALUE;
}
