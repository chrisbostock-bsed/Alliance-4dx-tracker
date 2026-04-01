import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const entries = await prisma.lagMeasureEntry.findMany({
    where: { lagMeasureId: measureId },
    orderBy: { recordedAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const body = await request.json();
  const { value, notes, recordedAt, source } = body;

  if (value == null) return NextResponse.json({ error: "value is required" }, { status: 400 });

  const entry = await prisma.lagMeasureEntry.create({
    data: {
      lagMeasureId: measureId,
      value: parseFloat(value),
      notes,
      source,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
