import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ commitmentId: string }> }) {
  const { commitmentId } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  const commitment = await prisma.commitment.update({
    where: { id: commitmentId },
    data: { status },
  });
  return NextResponse.json(commitment);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ commitmentId: string }> }) {
  const { commitmentId } = await params;
  await prisma.commitment.delete({ where: { id: commitmentId } });
  return NextResponse.json({ success: true });
}
