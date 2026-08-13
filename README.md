# PeopleSync

A workforce coordination and daily work allocation tool for customer service, contact centre and operations teams.

**Right person. Right work. Right time. Clear every day.**

Every employee opens the app and immediately knows what they're working on right now and what's next. Leaders get a
clear view of workforce allocation, coverage, capacity and priorities across the whole team.

This is a self-contained MVP: all data lives in a local SQLite database and is edited directly in the app or
imported from Excel / CSV. There are no external system connections yet — see [Phase 2](#phase-2-ideas) for what's
next.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + hand-rolled shadcn/ui-style components
- Prisma ORM + SQLite
- `xlsx` (SheetJS) for Excel / CSV import, parsed client-side

## Getting started

```bash
npm install
cp .env.example .env      # already points at a local SQLite file
npm run db:push           # create the SQLite schema
npm run db:seed           # load ~20 sample employees, teams, a full day's schedule
npm run dev                # http://localhost:3000
```

Use the **Employee / Leader** switcher in the top-right corner to preview both experiences. There's no
authentication in this version — it's a demo-mode role switcher only.

Other useful scripts:

```bash
npm run db:reset   # wipe and re-seed the database
npm run build       # production build (also runs `prisma generate`)
```

The sample data is seeded relative to the date you run `npm run db:seed`, so if the demo starts looking empty after
some time has passed, re-run `npm run db:reset`.

## Project structure

```
prisma/schema.prisma       Data model (see below)
prisma/seed.ts             Sample data: teams, employees, skills, work types, a full day's roster
src/lib/                   Shared types, formatting helpers, category/priority styling
src/server/services/       All database access — the seam for future integrations
src/app/<route>/actions.ts Server actions (mutations) per feature area, thin wrappers over the services
src/app/<route>/page.tsx   Server-rendered pages
src/components/ui/         Generic UI primitives (button, card, dialog, table, ...)
src/components/domain/     App-specific building blocks (timeline, allocation dialog, workforce row, ...)
```

## Data model

- **Team** — groups employees, has a leader
- **Employee** — self-referential `leaderId` for reporting lines, optional `teamId`, `isLeader` flag
- **Skill** / **EmployeeSkill** — what each employee is qualified for
- **WorkType** — a type of work employees can be allocated to (category, priority, required skill, target staffing)
- **Shift** — one employee's rostered start/finish time for one date
- **Allocation** — a time block within a shift, linked to a `WorkType` (this is what the Workforce Allocation
  Board and My Day timeline both render)
- **Briefing** — one per date, shown to employees on My Day
- **Announcement** — title/message/priority/expiry, shown while active

SQLite has no native enum type, so category/priority/leave-kind fields are plain `String` columns whose allowed
values are defined once in `src/lib/types.ts` and enforced at the application boundary (forms, import validation).

Every `Employee`, `Shift` and `Allocation` record carries a `source` field (`"manual"` or `"import"` today). A
future sync job can write `"zendesk"`, `"salesforce"`, etc. into the same tables without a schema change.

## How the Excel / CSV importer works

`/import` is a three-stage wizard:

1. **Upload** — pick a `.xlsx`, `.xls` or `.csv` file. Parsing happens client-side with SheetJS.
2. **Preview and map** — the first rows are shown, and each spreadsheet column gets a dropdown to map it onto a
   PeopleSync field (Employee Name, Team, Date, Shift Start, Work Type, Allocation Start, Leave Type, Skill, ...).
   Column headers are auto-matched where possible (e.g. "Staff Member" → "Employee Name").
3. **Validate and import** — every row is parsed and classified as **Valid**, **Warning**, or **Error**, with the
   reason shown inline. Nothing is ever silently dropped: error rows stay visible (and unselected) so you can see
   exactly what needs fixing, rather than disappearing. Valid and warning rows are pre-selected and can be
   deselected before committing.

Importing is idempotent-ish by design: employees are matched by Employee ID first, then by name, and re-importing
updates the same records rather than duplicating them. Everything the importer creates can also be edited by hand
afterwards — there's no need to re-upload a spreadsheet just to fix one shift.

## Phase 2 ideas

Deliberately out of scope for this MVP, but the data model and service-layer seam were built to support them:

- Real authentication and role-based permissions
- Live integrations: Zendesk, Salesforce, Slack, Microsoft Teams
- Forecasting, demand planning and automated/optimised rostering
- Real-time queue data and service-level monitoring
- AI-assisted scheduling recommendations
- Manual capacity overrides alongside the calculated shrinkage numbers
