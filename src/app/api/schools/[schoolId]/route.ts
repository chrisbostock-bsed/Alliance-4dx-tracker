import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      wigs: {
        include: { leadMeasures: true, lagMeasures: true },
        orderBy: { createdAt: "desc" },
      },
      wigSessions: {
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
      teams: true,
    },
  });
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(school);
}

export async function PUT(request: Request, { params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  const body = await request.json();
  const school = await prisma.school.update({
    where: { id: schoolId },
    data: body,
  });
  return NextResponse.json(school);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  await prisma.school.update({ where: { id: schoolId }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
