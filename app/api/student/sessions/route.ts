import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    const sessions = await prisma.session.findMany({
      where: { studentId },
      select: {
        examId: true,
        status: true,
        submittedAt: true,
        isInvalidated: true,
        score: true,
      } as any
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error("Fetch student sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
