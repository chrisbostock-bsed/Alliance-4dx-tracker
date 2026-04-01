import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ wigId: string }> }) {
  const { wigId } = await params;
  const wig = await prisma.wIG.findUnique({
    where: { id: wigId },
    include: {
      school: true,
      team: true,
      leadMeasures: {
        include: { entries: { orderBy: { recordedAt: "asc" } } },
      },
      lagMeasures: {
        include: { entries: { orderBy: { recordedAt: "asc" } } },
      },
      wigSessions: {
        include: { commitments: true },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });
  if (!wig) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(wig);
}

export async function PUT(request: Request, { params }: { params: Promise<{ wigId: string }> }) {
  const { wigId } = await params;
  const body = await request.json();

  const updateData: Record<string, any> = {};
  const allowed = ["title", "description", "category", "status", "currentValue", "targetValue", "targetDate", "unit"];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updateData[key] =
        key === "targetDate" ? new Date(body[key]) :
        ["currentValue", "targetValue"].includes(key) ? parseFloat(body[key]) :
        body[key];
    }
  }

  const wig = await prisma.wIG.update({ where: { id: wigId }, data: updateData });
  return NextResponse.json(wig);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ wigId: string }> }) {
  const { wigId } = await params;
  await prisma.wIG.delete({ where: { id: wigId } });
  return NextResponse.json({ success: true });
}
