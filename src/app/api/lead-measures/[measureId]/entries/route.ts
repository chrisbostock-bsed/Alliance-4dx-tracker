import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const entries = await prisma.leadMeasureEntry.findMany({
    where: { leadMeasureId: measureId },
    orderBy: { recordedAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const body = await request.json();
  const { value, notes, recordedAt } = body;

  if (value == null) return NextResponse.json({ error: "value is required" }, { status: 400 });

  const entry = await prisma.leadMeasureEntry.create({
    data: {
      leadMeasureId: measureId,
      value: parseFloat(value),
      notes,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
