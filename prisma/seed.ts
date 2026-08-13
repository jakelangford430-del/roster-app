import { PrismaClient } from "@prisma/client";
import type { WorkCategory, Priority, LeaveKind } from "../src/lib/types";

const prisma = new PrismaClient();

function today(offsetDays = 0): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.allocation.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.employeeSkill.deleteMany();
  await prisma.workType.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.team.deleteMany();
  await prisma.briefing.deleteMany();
  await prisma.announcement.deleteMany();

  // ---------------------------------------------------------------------
  // Skills
  // ---------------------------------------------------------------------
  console.log("Creating skills...");
  const skillNames = [
    "Billing Calls",
    "Retention",
    "Webchat",
    "Salesforce",
    "Field Support",
    "Email Tickets",
    "Zendesk",
    "Quality Assurance",
    "Outbound Calls",
  ];
  const skills: Record<string, { id: string }> = {};
  for (const name of skillNames) {
    skills[name] = await prisma.skill.create({ data: { name } });
  }

  // ---------------------------------------------------------------------
  // Work types
  // ---------------------------------------------------------------------
  console.log("Creating work types...");
  type WTSeed = {
    name: string;
    category: WorkCategory;
    description: string;
    priority?: Priority;
    targetStaffing?: number;
    requiredSkill?: string;
    leaveKind?: LeaveKind;
  };
  const workTypeSeeds: WTSeed[] = [
    { name: "Inbound Billing Queue", category: "VOICE", description: "Inbound calls about bills and payments.", priority: "HIGH", targetStaffing: 6, requiredSkill: "Billing Calls" },
    { name: "Inbound General Support", category: "VOICE", description: "General inbound support queue.", priority: "NORMAL", targetStaffing: 5 },
    { name: "Outbound Retention Calls", category: "VOICE", description: "Proactive outbound retention calls.", priority: "NORMAL", targetStaffing: 3, requiredSkill: "Retention" },
    { name: "Webchat", category: "DIGITAL", description: "Live webchat queue.", priority: "HIGH", targetStaffing: 4, requiredSkill: "Webchat" },
    { name: "Email Tickets", category: "DIGITAL", description: "General email ticket queue.", priority: "NORMAL", targetStaffing: 3, requiredSkill: "Email Tickets" },
    { name: "Zendesk Tickets", category: "DIGITAL", description: "Zendesk support ticket queue.", priority: "NORMAL", targetStaffing: 3, requiredSkill: "Zendesk" },
    { name: "Salesforce Cases", category: "CASES", description: "Case work logged in Salesforce.", priority: "NORMAL", targetStaffing: 3, requiredSkill: "Salesforce" },
    { name: "Meter Search Requests", category: "CASES", description: "Meter identification / search requests.", priority: "LOW", targetStaffing: 2 },
    { name: "Retention Cases", category: "CASES", description: "Save & retention case queue.", priority: "HIGH", targetStaffing: 2, requiredSkill: "Retention" },
    { name: "Process Breach Review", category: "CASES", description: "Reviewing process/compliance breaches.", priority: "HIGH", targetStaffing: 1 },
    { name: "Field Support Requests", category: "SUPPORT", description: "Support requests from field technicians.", priority: "NORMAL", targetStaffing: 2, requiredSkill: "Field Support" },
    { name: "Quality Assurance Review", category: "SUPPORT", description: "QA scoring of calls and tickets.", priority: "NORMAL", targetStaffing: 1, requiredSkill: "Quality Assurance" },
    { name: "Training", category: "TRAINING", description: "Scheduled training session.", priority: "NORMAL" },
    { name: "Team Meeting", category: "MEETINGS", description: "Team huddle or stand-up.", priority: "NORMAL" },
    { name: "1:1 Coaching", category: "MEETINGS", description: "One-on-one coaching session with leader.", priority: "NORMAL" },
    { name: "Administration", category: "ADMINISTRATION", description: "General admin and housekeeping tasks.", priority: "LOW" },
    { name: "Lunch Break", category: "BREAK", description: "Unpaid lunch break.", priority: "LOW" },
    { name: "Short Break", category: "BREAK", description: "Paid short break.", priority: "LOW" },
    { name: "Annual Leave", category: "LEAVE", description: "Approved annual leave.", priority: "LOW", leaveKind: "ANNUAL" },
    { name: "Sick Leave", category: "LEAVE", description: "Unplanned sick leave.", priority: "LOW", leaveKind: "SICK" },
    { name: "Process Improvement Project", category: "PROJECT", description: "Cross-functional improvement project work.", priority: "NORMAL" },
  ];
  const workTypes: Record<string, { id: string }> = {};
  for (const wt of workTypeSeeds) {
    workTypes[wt.name] = await prisma.workType.create({
      data: {
        name: wt.name,
        category: wt.category,
        description: wt.description,
        priority: wt.priority ?? "NORMAL",
        targetStaffing: wt.targetStaffing ?? null,
        leaveKind: wt.leaveKind ?? null,
        requiredSkillId: wt.requiredSkill ? skills[wt.requiredSkill].id : null,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Teams
  // ---------------------------------------------------------------------
  console.log("Creating teams...");
  const teamNames = ["Billing & Payments", "Retention & Sales", "Digital Support", "Field & Technical"];
  const teams: Record<string, { id: string }> = {};
  for (const name of teamNames) {
    teams[name] = await prisma.team.create({ data: { name } });
  }

  // ---------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------
  console.log("Creating employees...");
  type EmpSeed = {
    name: string;
    team: string;
    isLeader?: boolean;
    leaderName?: string;
    skills: string[];
    shiftStart: string;
    shiftEnd: string;
  };

  const employeeSeeds: EmpSeed[] = [
    { name: "Sarah Mitchell", team: "Billing & Payments", isLeader: true, skills: ["Billing Calls", "Quality Assurance"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "David Chen", team: "Retention & Sales", isLeader: true, skills: ["Retention", "Outbound Calls", "Quality Assurance"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "Michael Ross", team: "Digital Support", isLeader: true, skills: ["Webchat", "Zendesk", "Quality Assurance"], shiftStart: "08:30", shiftEnd: "17:00" },
    { name: "Priya Patel", team: "Field & Technical", isLeader: true, skills: ["Field Support", "Salesforce", "Quality Assurance"], shiftStart: "08:30", shiftEnd: "17:00" },

    { name: "Joanne Baker", team: "Billing & Payments", leaderName: "Sarah Mitchell", skills: ["Billing Calls", "Retention", "Webchat", "Salesforce", "Field Support"], shiftStart: "08:30", shiftEnd: "17:00" },
    { name: "Liam O'Connor", team: "Billing & Payments", leaderName: "Sarah Mitchell", skills: ["Billing Calls", "Email Tickets"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "Emma Wilson", team: "Billing & Payments", leaderName: "Sarah Mitchell", skills: ["Billing Calls", "Webchat"], shiftStart: "09:00", shiftEnd: "17:30" },
    { name: "Noah Ahmed", team: "Billing & Payments", leaderName: "Sarah Mitchell", skills: ["Billing Calls"], shiftStart: "07:30", shiftEnd: "16:00" },
    { name: "Olivia Grant", team: "Billing & Payments", leaderName: "Sarah Mitchell", skills: ["Billing Calls", "Salesforce"], shiftStart: "08:00", shiftEnd: "16:30" },

    { name: "Ethan Walsh", team: "Retention & Sales", leaderName: "David Chen", skills: ["Retention", "Outbound Calls"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "Ava Thompson", team: "Retention & Sales", leaderName: "David Chen", skills: ["Retention", "Salesforce"], shiftStart: "08:30", shiftEnd: "17:00" },
    { name: "Jack Nguyen", team: "Retention & Sales", leaderName: "David Chen", skills: ["Retention", "Outbound Calls", "Email Tickets"], shiftStart: "09:00", shiftEnd: "17:30" },
    { name: "Mia Roberts", team: "Retention & Sales", leaderName: "David Chen", skills: ["Retention"], shiftStart: "08:00", shiftEnd: "16:30" },

    { name: "Lucas Ferreira", team: "Digital Support", leaderName: "Michael Ross", skills: ["Webchat", "Zendesk"], shiftStart: "08:30", shiftEnd: "17:00" },
    { name: "Chloe Bennett", team: "Digital Support", leaderName: "Michael Ross", skills: ["Webchat", "Email Tickets", "Zendesk"], shiftStart: "09:00", shiftEnd: "17:30" },
    { name: "Ryan Coleman", team: "Digital Support", leaderName: "Michael Ross", skills: ["Zendesk", "Email Tickets"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "Grace Kelly", team: "Digital Support", leaderName: "Michael Ross", skills: ["Webchat"], shiftStart: "10:00", shiftEnd: "18:30" },

    { name: "Daniel Brooks", team: "Field & Technical", leaderName: "Priya Patel", skills: ["Field Support"], shiftStart: "08:00", shiftEnd: "16:30" },
    { name: "Sophie Turner", team: "Field & Technical", leaderName: "Priya Patel", skills: ["Field Support", "Salesforce"], shiftStart: "08:30", shiftEnd: "17:00" },
    { name: "Tom Richards", team: "Field & Technical", leaderName: "Priya Patel", skills: ["Field Support", "Quality Assurance"], shiftStart: "08:00", shiftEnd: "16:30" },
  ];

  const employees: Record<string, { id: string }> = {};
  // First pass: create without leader relation
  for (const e of employeeSeeds) {
    employees[e.name] = await prisma.employee.create({
      data: {
        name: e.name,
        email: `${e.name.toLowerCase().replace(/[^a-z]+/g, ".")}@myconnect.example`,
        isLeader: e.isLeader ?? false,
        teamId: teams[e.team].id,
      },
    });
  }
  // Second pass: leader relations + team leader + skills
  for (const e of employeeSeeds) {
    if (e.leaderName) {
      await prisma.employee.update({
        where: { id: employees[e.name].id },
        data: { leaderId: employees[e.leaderName].id },
      });
    }
    await prisma.employeeSkill.createMany({
      data: e.skills.map((s) => ({ employeeId: employees[e.name].id, skillId: skills[s].id })),
    });
  }
  for (const teamName of teamNames) {
    const leaderSeed = employeeSeeds.find((e) => e.isLeader && e.team === teamName);
    if (leaderSeed) {
      await prisma.team.update({
        where: { id: teams[teamName].id },
        data: { leaderId: employees[leaderSeed.name].id },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Shifts + allocations for today
  // ---------------------------------------------------------------------
  console.log("Building today's schedule...");
  const todayDate = today(0);

  async function buildDay(
    empName: string,
    shiftStart: string,
    shiftEnd: string,
    blocks: { workType: string; start: string; end: string; channel?: string }[]
  ) {
    const shift = await prisma.shift.create({
      data: {
        employeeId: employees[empName].id,
        date: todayDate,
        startTime: shiftStart,
        endTime: shiftEnd,
      },
    });
    for (const b of blocks) {
      await prisma.allocation.create({
        data: {
          shiftId: shift.id,
          employeeId: employees[empName].id,
          workTypeId: workTypes[b.workType].id,
          startTime: b.start,
          endTime: b.end,
          channel: b.channel ?? null,
        },
      });
    }
  }

  // Leaders: mostly meetings, coaching, QA and admin
  await buildDay("Sarah Mitchell", "08:00", "16:30", [
    { workType: "Team Meeting", start: "08:00", end: "08:30" },
    { workType: "Quality Assurance Review", start: "08:30", end: "10:30" },
    { workType: "1:1 Coaching", start: "10:30", end: "11:30" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Administration", start: "12:30", end: "14:30" },
    { workType: "1:1 Coaching", start: "14:30", end: "15:30" },
    { workType: "Administration", start: "15:30", end: "16:30" },
  ]);

  await buildDay("David Chen", "08:00", "16:30", [
    { workType: "Team Meeting", start: "08:00", end: "08:30" },
    { workType: "Outbound Retention Calls", start: "08:30", end: "10:30", channel: "Retention Outbound" },
    { workType: "1:1 Coaching", start: "10:30", end: "11:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Quality Assurance Review", start: "12:30", end: "14:30" },
    { workType: "Administration", start: "14:30", end: "16:30" },
  ]);

  await buildDay("Michael Ross", "08:30", "17:00", [
    { workType: "Team Meeting", start: "08:30", end: "09:00" },
    { workType: "Webchat", start: "09:00", end: "11:00", channel: "Digital Support Chat" },
    { workType: "Quality Assurance Review", start: "11:00", end: "12:30" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "1:1 Coaching", start: "13:00", end: "14:00" },
    { workType: "Administration", start: "14:00", end: "17:00" },
  ]);

  await buildDay("Priya Patel", "08:30", "17:00", [
    { workType: "Team Meeting", start: "08:30", end: "09:00" },
    { workType: "Field Support Requests", start: "09:00", end: "11:00" },
    { workType: "1:1 Coaching", start: "11:00", end: "12:00" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "Quality Assurance Review", start: "13:00", end: "15:00" },
    { workType: "Administration", start: "15:00", end: "17:00" },
  ]);

  // Joanne — versatile, multi-skilled
  await buildDay("Joanne Baker", "08:30", "17:00", [
    { workType: "Inbound Billing Queue", start: "08:30", end: "10:00", channel: "Billing Queue" },
    { workType: "Webchat", start: "10:00", end: "12:00", channel: "Digital Support Chat" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Salesforce Cases", start: "12:30", end: "14:00" },
    { workType: "Training", start: "14:00", end: "15:00" },
    { workType: "Inbound General Support", start: "15:00", end: "17:00", channel: "General Support" },
  ]);

  await buildDay("Liam O'Connor", "08:00", "16:30", [
    { workType: "Inbound Billing Queue", start: "08:00", end: "10:00", channel: "Billing Queue" },
    { workType: "Email Tickets", start: "10:00", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Inbound Billing Queue", start: "12:30", end: "16:30", channel: "Billing Queue" },
  ]);

  await buildDay("Emma Wilson", "09:00", "17:30", [
    { workType: "Inbound Billing Queue", start: "09:00", end: "12:00", channel: "Billing Queue" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Webchat", start: "12:30", end: "15:00", channel: "Digital Support Chat" },
    { workType: "Training", start: "15:00", end: "16:00" },
    { workType: "Inbound Billing Queue", start: "16:00", end: "17:30", channel: "Billing Queue" },
  ]);

  // Noah — annual leave, whole day
  await buildDay("Noah Ahmed", "07:30", "16:00", [
    { workType: "Annual Leave", start: "07:30", end: "16:00" },
  ]);

  await buildDay("Olivia Grant", "08:00", "16:30", [
    { workType: "Inbound Billing Queue", start: "08:00", end: "09:30", channel: "Billing Queue" },
    { workType: "Salesforce Cases", start: "09:30", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Process Breach Review", start: "12:30", end: "14:30" },
    { workType: "Administration", start: "14:30", end: "16:30" },
  ]);

  await buildDay("Ethan Walsh", "08:00", "16:30", [
    { workType: "Outbound Retention Calls", start: "08:00", end: "10:30", channel: "Retention Outbound" },
    { workType: "Retention Cases", start: "10:30", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Outbound Retention Calls", start: "12:30", end: "16:30", channel: "Retention Outbound" },
  ]);

  await buildDay("Ava Thompson", "08:30", "17:00", [
    { workType: "Retention Cases", start: "08:30", end: "11:00" },
    { workType: "Salesforce Cases", start: "11:00", end: "12:30" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "Outbound Retention Calls", start: "13:00", end: "17:00", channel: "Retention Outbound" },
  ]);

  // Jack — sick leave, whole day
  await buildDay("Jack Nguyen", "09:00", "17:30", [
    { workType: "Sick Leave", start: "09:00", end: "17:30" },
  ]);

  await buildDay("Mia Roberts", "08:00", "16:30", [
    { workType: "Outbound Retention Calls", start: "08:00", end: "10:00", channel: "Retention Outbound" },
    { workType: "Training", start: "10:00", end: "11:30" },
    { workType: "Outbound Retention Calls", start: "11:30", end: "12:00", channel: "Retention Outbound" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Retention Cases", start: "12:30", end: "16:30" },
  ]);

  await buildDay("Lucas Ferreira", "08:30", "17:00", [
    { workType: "Webchat", start: "08:30", end: "11:00", channel: "Digital Support Chat" },
    { workType: "Zendesk Tickets", start: "11:00", end: "12:30" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "Webchat", start: "13:00", end: "17:00", channel: "Digital Support Chat" },
  ]);

  await buildDay("Chloe Bennett", "09:00", "17:30", [
    { workType: "Zendesk Tickets", start: "09:00", end: "11:30" },
    { workType: "Email Tickets", start: "11:30", end: "12:30" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "Webchat", start: "13:00", end: "15:30", channel: "Digital Support Chat" },
    { workType: "Process Improvement Project", start: "15:30", end: "17:30" },
  ]);

  // Ryan — deliberately left with a gap in the afternoon (demonstrates "unallocated")
  await buildDay("Ryan Coleman", "08:00", "16:30", [
    { workType: "Zendesk Tickets", start: "08:00", end: "10:00" },
    { workType: "Email Tickets", start: "10:00", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
  ]);

  await buildDay("Grace Kelly", "10:00", "18:30", [
    { workType: "Webchat", start: "10:00", end: "13:00", channel: "Digital Support Chat" },
    { workType: "Lunch Break", start: "13:00", end: "13:30" },
    { workType: "Webchat", start: "13:30", end: "16:30", channel: "Digital Support Chat" },
    { workType: "Training", start: "16:30", end: "18:30" },
  ]);

  await buildDay("Daniel Brooks", "08:00", "16:30", [
    { workType: "Field Support Requests", start: "08:00", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Field Support Requests", start: "12:30", end: "16:30" },
  ]);

  await buildDay("Sophie Turner", "08:30", "17:00", [
    { workType: "Meter Search Requests", start: "08:30", end: "10:30" },
    { workType: "Field Support Requests", start: "10:30", end: "12:30" },
    { workType: "Lunch Break", start: "12:30", end: "13:00" },
    { workType: "Salesforce Cases", start: "13:00", end: "17:00" },
  ]);

  await buildDay("Tom Richards", "08:00", "16:30", [
    { workType: "Field Support Requests", start: "08:00", end: "10:00" },
    { workType: "Quality Assurance Review", start: "10:00", end: "12:00" },
    { workType: "Lunch Break", start: "12:00", end: "12:30" },
    { workType: "Field Support Requests", start: "12:30", end: "16:30" },
  ]);

  // A lighter second day so the date switcher has something to show.
  console.log("Building tomorrow's (lighter) schedule...");
  const tomorrowDate = today(1);
  const lightDayNames = ["Sarah Mitchell", "Joanne Baker", "Liam O'Connor", "David Chen", "Ava Thompson", "Michael Ross", "Lucas Ferreira", "Priya Patel", "Daniel Brooks"];
  for (const name of lightDayNames) {
    const seed = employeeSeeds.find((e) => e.name === name)!;
    const shift = await prisma.shift.create({
      data: { employeeId: employees[name].id, date: tomorrowDate, startTime: seed.shiftStart, endTime: seed.shiftEnd },
    });
    await prisma.allocation.create({
      data: {
        shiftId: shift.id,
        employeeId: employees[name].id,
        workTypeId: workTypes["Administration"].id,
        startTime: seed.shiftStart,
        endTime: seed.shiftEnd,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Briefing + Announcements
  // ---------------------------------------------------------------------
  console.log("Creating briefing and announcements...");
  await prisma.briefing.create({
    data: {
      date: todayDate,
      heading: "Focus today: billing queue volume",
      message:
        "Billing queue volumes are forecast 20% above average this morning following yesterday's statement run. Digital channels remain steady. Thanks for the flexibility covering peak periods.",
      priorities: "Keep Inbound Billing Queue answered within SLA\nClear overnight webchat backlog before 10:30 AM\nComplete QA reviews for last week's retention calls",
      risks: "Two team members on leave today, reducing Billing & Payments coverage\nPossible system slowness during the 2:00 PM Salesforce release window",
      operationalNotes: "New Salesforce case layout goes live at 2:00 PM — a quick walkthrough will be shared in the team chat beforehand.",
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Salesforce case layout update — 2:00 PM today",
      message: "A short walkthrough of the new Salesforce case layout will be shared before the 2:00 PM release. No action needed, just be aware the screen will look different afterwards.",
      date: todayDate,
      priority: "IMPORTANT",
      expiryDate: today(1),
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Storm impact — expect higher call volumes in affected regions",
      message: "Following last night's storms, expect elevated inbound volume related to outages and field appointments. Please prioritise safety-related and outage calls.",
      date: todayDate,
      priority: "CRITICAL",
      expiryDate: today(2),
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Reminder: quarterly engagement survey closes Friday",
      message: "Please complete the quarterly engagement survey before Friday. It takes about five minutes and your feedback directly shapes the next roster cycle.",
      date: today(-2),
      priority: "NORMAL",
      expiryDate: today(4),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
