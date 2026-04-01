import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const measure = await prisma.leadMeasure.findUnique({
    where: { id: measureId },
    include: { entries: { orderBy: { recordedAt: "asc" } }, wig: true },
  });
  if (!measure) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(measure);
}

export async function PUT(request: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const body = await request.json();
  const measure = await prisma.leadMeasure.update({ where: { id: measureId }, data: body });
  return NextResponse.json(measure);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  await prisma.leadMeasure.update({ where: { id: measureId }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
