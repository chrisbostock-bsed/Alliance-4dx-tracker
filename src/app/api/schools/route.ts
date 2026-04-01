import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schools = await prisma.school.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { wigs: true, wigSessions: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(schools);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, shortName, location, gradeSpan } = body;

  if (!name || !shortName) {
    return NextResponse.json({ error: "name and shortName are required" }, { status: 400 });
  }

  const school = await prisma.school.create({
    data: { name, shortName, location, gradeSpan },
  });
  return NextResponse.json(school, { status: 201 });
}
