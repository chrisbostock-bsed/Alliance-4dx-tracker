import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { WigCategory, WigStatus, TrackingPeriod, SessionStatus, CommitmentStatus } from "../src/generated/prisma/enums";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function addWeeks(date: Date, weeks: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function subWeeks(date: Date, weeks: number) {
  return addWeeks(date, -weeks);
}

async function main() {
  console.log("Seeding Alliance College-Ready Public Schools data...");

  // ── Schools ──────────────────────────────────────────────────────────────
  const schools = await Promise.all([
    prisma.school.upsert({
      where: { id: "school-neuwirth" },
      update: {},
      create: {
        id: "school-neuwirth",
        name: "Alliance Patti & Peter Neuwirth Leadership Academy",
        shortName: "Neuwirth",
        location: "Los Angeles, CA",
        gradeSpan: "6-12",
      },
    }),
    prisma.school.upsert({
      where: { id: "school-collins" },
      update: {},
      create: {
        id: "school-collins",
        name: "Alliance Collins Family College-Ready High School",
        shortName: "Collins",
        location: "Los Angeles, CA",
        gradeSpan: "9-12",
      },
    }),
    prisma.school.upsert({
      where: { id: "school-burton" },
      update: {},
      create: {
        id: "school-burton",
        name: "Alliance Judy Ivie Burton Technology Academy High School",
        shortName: "Burton Tech",
        location: "Los Angeles, CA",
        gradeSpan: "9-12",
      },
    }),
    prisma.school.upsert({
      where: { id: "school-stern" },
      update: {},
      create: {
        id: "school-stern",
        name: "Alliance Marc & Eva Stern Math and Science School",
        shortName: "Stern Math",
        location: "Los Angeles, CA",
        gradeSpan: "6-12",
      },
    }),
    prisma.school.upsert({
      where: { id: "school-mohan" },
      update: {},
      create: {
        id: "school-mohan",
        name: "Alliance Dr. Olga Mohan High School",
        shortName: "Mohan",
        location: "Los Angeles, CA",
        gradeSpan: "9-12",
      },
    }),
  ]);

  const [neuwirth, collins, burton, stern, mohan] = schools;
  const today = new Date();
  const targetDate = new Date("2025-06-30");

  // ── WIGs ─────────────────────────────────────────────────────────────────
  // Neuwirth: ELA WIG
  const wigELANeuwirth = await prisma.wIG.upsert({
    where: { id: "wig-ela-neuwirth" },
    update: {},
    create: {
      id: "wig-ela-neuwirth",
      title: "Move ELA proficiency from 42% to 65% by June 2025",
      description: "Increase the percentage of students scoring proficient or above on ELA assessments",
      category: WigCategory.ACADEMIC,
      status: WigStatus.ACTIVE,
      baselineValue: 42,
      targetValue: 65,
      currentValue: 54,
      unit: "%",
      targetDate,
      schoolId: neuwirth.id,
    },
  });

  // Neuwirth: Attendance WIG
  const wigAttNeuwirth = await prisma.wIG.upsert({
    where: { id: "wig-att-neuwirth" },
    update: {},
    create: {
      id: "wig-att-neuwirth",
      title: "Reduce chronic absenteeism from 22% to 10% by June 2025",
      description: "Students missing 10% or more of school days",
      category: WigCategory.ATTENDANCE,
      status: WigStatus.ACTIVE,
      baselineValue: 22,
      targetValue: 10,
      currentValue: 15,
      unit: "%",
      targetDate,
      schoolId: neuwirth.id,
    },
  });

  // Collins: Math WIG
  const wigMathCollins = await prisma.wIG.upsert({
    where: { id: "wig-math-collins" },
    update: {},
    create: {
      id: "wig-math-collins",
      title: "Move Math proficiency from 35% to 58% by June 2025",
      description: "Increase the percentage of students scoring proficient or above on Math assessments",
      category: WigCategory.ACADEMIC,
      status: WigStatus.ACTIVE,
      baselineValue: 35,
      targetValue: 58,
      currentValue: 47,
      unit: "%",
      targetDate,
      schoolId: collins.id,
    },
  });

  // Collins: Teacher coaching WIG
  const wigCoachCollins = await prisma.wIG.upsert({
    where: { id: "wig-coach-collins" },
    update: {},
    create: {
      id: "wig-coach-collins",
      title: "Increase instructional coaching cycles from 1 to 3 per teacher by June 2025",
      description: "Every teacher receives at least 3 full coaching cycles with observation and debrief",
      category: WigCategory.TEACHER,
      status: WigStatus.ACTIVE,
      baselineValue: 1,
      targetValue: 3,
      currentValue: 2,
      unit: "cycles",
      targetDate,
      schoolId: collins.id,
    },
  });

  // Burton: ELA WIG
  const wigELABurton = await prisma.wIG.upsert({
    where: { id: "wig-ela-burton" },
    update: {},
    create: {
      id: "wig-ela-burton",
      title: "Move ELA proficiency from 38% to 60% by June 2025",
      category: WigCategory.ACADEMIC,
      status: WigStatus.ACTIVE,
      baselineValue: 38,
      targetValue: 60,
      currentValue: 45,
      unit: "%",
      targetDate,
      schoolId: burton.id,
    },
  });

  // Stern: Math WIG
  const wigMathStern = await prisma.wIG.upsert({
    where: { id: "wig-math-stern" },
    update: {},
    create: {
      id: "wig-math-stern",
      title: "Move Math proficiency from 55% to 80% by June 2025",
      description: "Stern Math and Science — stretch target given school focus",
      category: WigCategory.ACADEMIC,
      status: WigStatus.ACTIVE,
      baselineValue: 55,
      targetValue: 80,
      currentValue: 68,
      unit: "%",
      targetDate,
      schoolId: stern.id,
    },
  });

  // Mohan: Attendance WIG
  const wigAttMohan = await prisma.wIG.upsert({
    where: { id: "wig-att-mohan" },
    update: {},
    create: {
      id: "wig-att-mohan",
      title: "Increase daily attendance rate from 88% to 96% by June 2025",
      category: WigCategory.ATTENDANCE,
      status: WigStatus.ACTIVE,
      baselineValue: 88,
      targetValue: 96,
      currentValue: 93,
      unit: "%",
      targetDate,
      schoolId: mohan.id,
    },
  });

  // ── Lead Measures ─────────────────────────────────────────────────────────

  // ELA Neuwirth lead measures
  const lm1 = await prisma.leadMeasure.upsert({
    where: { id: "lm-ela-coaching" },
    update: {},
    create: {
      id: "lm-ela-coaching",
      title: "ELA teachers complete targeted coaching observation + debrief",
      wigId: wigELANeuwirth.id,
      targetValue: 2,
      unit: "observations/week",
      trackingPeriod: TrackingPeriod.WEEKLY,
    },
  });

  const lm2 = await prisma.leadMeasure.upsert({
    where: { id: "lm-ela-writing" },
    update: {},
    create: {
      id: "lm-ela-writing",
      title: "Students complete structured writing tasks with teacher feedback",
      wigId: wigELANeuwirth.id,
      targetValue: 3,
      unit: "tasks/week",
      trackingPeriod: TrackingPeriod.WEEKLY,
    },
  });

  // Attendance Neuwirth lead measures
  const lm3 = await prisma.leadMeasure.upsert({
    where: { id: "lm-att-calls" },
    update: {},
    create: {
      id: "lm-att-calls",
      title: "Counselor outreach calls to chronically absent students",
      wigId: wigAttNeuwirth.id,
      targetValue: 10,
      unit: "calls/week",
      trackingPeriod: TrackingPeriod.WEEKLY,
    },
  });

  // Math Collins lead measures
  const lm4 = await prisma.leadMeasure.upsert({
    where: { id: "lm-math-exit" },
    update: {},
    create: {
      id: "lm-math-exit",
      title: "Math teachers administer exit tickets and record mastery data",
      wigId: wigMathCollins.id,
      targetValue: 4,
      unit: "exit tickets/week",
      trackingPeriod: TrackingPeriod.WEEKLY,
    },
  });

  // ── Lead Measure Entries (8 weeks of history) ─────────────────────────────
  const weeklyData = [
    { lmId: lm1.id, values: [1.5, 1.0, 2.0, 1.5, 2.0, 2.0, 1.5, 2.0] },
    { lmId: lm2.id, values: [2.0, 2.5, 3.0, 2.0, 3.0, 3.0, 2.5, 3.0] },
    { lmId: lm3.id, values: [7, 8, 9, 8, 10, 11, 10, 12] },
    { lmId: lm4.id, values: [3, 3, 4, 3, 4, 4, 4, 4] },
  ];

  for (const { lmId, values } of weeklyData) {
    for (let i = 0; i < values.length; i++) {
      const recordedAt = subWeeks(today, 7 - i);
      await prisma.leadMeasureEntry.create({
        data: { leadMeasureId: lmId, value: values[i], recordedAt },
      });
    }
  }

  // ── Lag Measures ──────────────────────────────────────────────────────────
  const lag1 = await prisma.lagMeasure.upsert({
    where: { id: "lag-ela-proficiency" },
    update: {},
    create: {
      id: "lag-ela-proficiency",
      title: "ELA Proficiency Rate (Illuminate Assessment)",
      wigId: wigELANeuwirth.id,
      targetValue: 65,
      unit: "%",
      trackingPeriod: TrackingPeriod.MONTHLY,
    },
  });

  const lag2 = await prisma.lagMeasure.upsert({
    where: { id: "lag-math-proficiency" },
    update: {},
    create: {
      id: "lag-math-proficiency",
      title: "Math Proficiency Rate (Illuminate Assessment)",
      wigId: wigMathCollins.id,
      targetValue: 58,
      unit: "%",
      trackingPeriod: TrackingPeriod.MONTHLY,
    },
  });

  // Monthly lag measure entries (6 months)
  const lagData = [
    { id: lag1.id, values: [42, 45, 47, 50, 52, 54] },
    { id: lag2.id, values: [35, 38, 41, 43, 46, 47] },
  ];

  for (const { id, values } of lagData) {
    for (let i = 0; i < values.length; i++) {
      const recordedAt = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      await prisma.lagMeasureEntry.create({
        data: { lagMeasureId: id, value: values[i], recordedAt, source: "Illuminate" },
      });
    }
  }

  // ── WIG Sessions ──────────────────────────────────────────────────────────
  const session1 = await prisma.wigSession.upsert({
    where: { id: "session-ela-1" },
    update: {},
    create: {
      id: "session-ela-1",
      title: "Week 8 WIG Session",
      scheduledAt: subWeeks(today, 2),
      conductedAt: subWeeks(today, 2),
      status: SessionStatus.COMPLETED,
      wigId: wigELANeuwirth.id,
      schoolId: neuwirth.id,
      notes: "Team reviewed assessment data. Celebrated 2% proficiency gain.",
    },
  });

  const session2 = await prisma.wigSession.upsert({
    where: { id: "session-ela-2" },
    update: {},
    create: {
      id: "session-ela-2",
      title: "Week 10 WIG Session",
      scheduledAt: subWeeks(today, 1),
      conductedAt: subWeeks(today, 1),
      status: SessionStatus.COMPLETED,
      wigId: wigELANeuwirth.id,
      schoolId: neuwirth.id,
    },
  });

  const session3 = await prisma.wigSession.upsert({
    where: { id: "session-ela-3" },
    update: {},
    create: {
      id: "session-ela-3",
      title: "Week 12 WIG Session",
      scheduledAt: addWeeks(today, 1),
      status: SessionStatus.SCHEDULED,
      wigId: wigELANeuwirth.id,
      schoolId: neuwirth.id,
    },
  });

  const sessionMath = await prisma.wigSession.upsert({
    where: { id: "session-math-1" },
    update: {},
    create: {
      id: "session-math-1",
      title: "Week 10 Math WIG Session",
      scheduledAt: subWeeks(today, 1),
      conductedAt: subWeeks(today, 1),
      status: SessionStatus.COMPLETED,
      wigId: wigMathCollins.id,
      schoolId: collins.id,
    },
  });

  // ── Commitments ───────────────────────────────────────────────────────────
  await prisma.commitment.createMany({
    data: [
      {
        description: "I will conduct 2 ELA coaching walkthroughs and provide written feedback",
        ownerName: "Principal Rivera",
        status: CommitmentStatus.KEPT,
        sessionId: session1.id,
      },
      {
        description: "I will pull Illuminate data for 9th grade ELA and share with department",
        ownerName: "Ms. Thompson",
        status: CommitmentStatus.KEPT,
        sessionId: session1.id,
      },
      {
        description: "I will host structured writing protocols PLC on Thursday",
        ownerName: "Ms. Garcia",
        status: CommitmentStatus.MODIFIED,
        sessionId: session1.id,
      },
      {
        description: "I will complete 2 coaching observations with 10th grade ELA teachers",
        ownerName: "Principal Rivera",
        status: CommitmentStatus.KEPT,
        sessionId: session2.id,
      },
      {
        description: "I will contact 10 chronically absent students and log outreach",
        ownerName: "Counselor Davis",
        status: CommitmentStatus.KEPT,
        sessionId: session2.id,
      },
      {
        description: "I will review exit ticket data with each math teacher this week",
        ownerName: "Asst. Principal Chen",
        status: CommitmentStatus.PENDING,
        sessionId: session3.id,
      },
      {
        description: "I will administer benchmark assessment to all 9th grade math classes",
        ownerName: "Mr. Ortega",
        status: CommitmentStatus.PENDING,
        sessionId: session3.id,
      },
      {
        description: "I will analyze exit ticket trends and share recommendations at next WIG session",
        ownerName: "Ms. Park",
        status: CommitmentStatus.KEPT,
        sessionId: sessionMath.id,
      },
    ],
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
