import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wigId = searchParams.get("wigId");
  const schoolId = searchParams.get("schoolId");

  const sessions = await prisma.wigSession.findMany({
    where: {
      ...(wigId ? { wigId } : {}),
      ...(schoolId ? { schoolId } : {}),
    },
    include: {
      wig: { select: { id: true, title: true, category: true } },
      school: { select: { id: true, shortName: true } },
      commitments: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, wigId, schoolId, scheduledAt, notes } = body;

  if (!wigId || !schoolId || !scheduledAt) {
    return NextResponse.json({ error: "wigId, schoolId, and scheduledAt are required" }, { status: 400 });
  }

  const session = await prisma.wigSession.create({
    data: {
      title,
      wigId,
      schoolId,
      scheduledAt: new Date(scheduledAt),
      notes,
    },
    include: { wig: true, school: true, commitments: true },
  });
  return NextResponse.json(session, { status: 201 });
}
