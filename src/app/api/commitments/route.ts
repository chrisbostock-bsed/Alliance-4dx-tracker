import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { description, ownerName, sessionId, previousCommitmentId } = body;

  if (!description || !ownerName || !sessionId) {
    return NextResponse.json({ error: "description, ownerName, and sessionId are required" }, { status: 400 });
  }

  const commitment = await prisma.commitment.create({
    data: { description, ownerName, sessionId, previousCommitmentId: previousCommitmentId || null },
  });
  return NextResponse.json(commitment, { status: 201 });
}
