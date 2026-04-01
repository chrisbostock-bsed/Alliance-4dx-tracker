import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const wigs = await prisma.wIG.findMany({
    where: {
      ...(schoolId ? { schoolId } : {}),
      ...(category ? { category: category as any } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      school: { select: { id: true, name: true, shortName: true } },
      team: { select: { id: true, name: true } },
      leadMeasures: { include: { entries: { orderBy: { recordedAt: "desc" }, take: 1 } } },
      lagMeasures: { include: { entries: { orderBy: { recordedAt: "desc" }, take: 1 } } },
      _count: { select: { wigSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(wigs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, category, baselineValue, targetValue, unit, targetDate, schoolId, teamId } = body;

  if (!title || !category || baselineValue == null || targetValue == null || !unit || !targetDate || !schoolId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const wig = await prisma.wIG.create({
    data: {
      title,
      description,
      category,
      baselineValue: parseFloat(baselineValue),
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(baselineValue),
      unit,
      targetDate: new Date(targetDate),
      schoolId,
      teamId: teamId || null,
    },
    include: { school: true },
  });
  return NextResponse.json(wig, { status: 201 });
}
