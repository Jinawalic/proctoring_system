import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalStudents, totalViolations, exams, sessions] = await Promise.all([
      prisma.student.count(),
      prisma.violation.count(),
      prisma.exam.findMany({ select: { status: true } }),
      prisma.session.findMany({ select: { status: true, isInvalidated: true, submittedAt: true } }),
    ]);

    const activeExams = exams.filter((e) => e.status === "Active").length;
    const suspiciousSessions = sessions.filter(
      (s) => s.status === "Violation" && !s.isInvalidated && !s.submittedAt
    ).length;

    return NextResponse.json({
      totalStudents,
      activeExams,
      totalViolations,
      suspiciousSessions,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
