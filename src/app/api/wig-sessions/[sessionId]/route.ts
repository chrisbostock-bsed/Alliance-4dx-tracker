import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.wigSession.findUnique({
    where: { id: sessionId },
    include: {
      wig: { include: { school: true, leadMeasures: { include: { entries: { orderBy: { recordedAt: "desc" }, take: 4 } } } } },
      school: true,
      commitments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PUT(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const body = await request.json();

  const data: Record<string, any> = {};
  if (body.status) data.status = body.status;
  if (body.title !== undefined) data.title = body.title;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.conductedAt) data.conductedAt = new Date(body.conductedAt);
  if (body.status === "COMPLETED" && !body.conductedAt) data.conductedAt = new Date();

  const session = await prisma.wigSession.update({ where: { id: sessionId }, data });
  return NextResponse.json(session);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  await prisma.wigSession.delete({ where: { id: sessionId } });
  return NextResponse.json({ success: true });
}
