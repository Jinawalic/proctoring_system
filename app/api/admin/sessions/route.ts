import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        submittedAt: null,
        isInvalidated: false,
      },
      include: {
        student: { select: { name: true, matricNumber: true } },
        exam: { select: { courseCode: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error("Fetch live sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
