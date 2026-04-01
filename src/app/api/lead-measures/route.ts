import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wigId = searchParams.get("wigId");

  const measures = await prisma.leadMeasure.findMany({
    where: { ...(wigId ? { wigId } : {}), isActive: true },
    include: {
      wig: { select: { id: true, title: true, school: { select: { shortName: true } } } },
      entries: { orderBy: { recordedAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(measures);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, wigId, targetValue, unit, trackingPeriod } = body;

  if (!title || !wigId || targetValue == null || !unit || !trackingPeriod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const measure = await prisma.leadMeasure.create({
    data: { title, description, wigId, targetValue: parseFloat(targetValue), unit, trackingPeriod },
  });
  return NextResponse.json(measure, { status: 201 });
}
