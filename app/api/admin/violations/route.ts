import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const violations = await prisma.violation.findMany({
      include: {
        student: {
          select: { name: true, matricNumber: true }
        },
        exam: {
          select: { title: true, courseCode: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedViolationsMap = new Map<string, any>();

    violations.forEach(v => {
      const key = `${v.studentId}-${v.examId}`;
      if (!formattedViolationsMap.has(key)) {
        formattedViolationsMap.set(key, {
          id: v.id,
          studentId: v.studentId,
          examId: v.examId,
          student: v.student.name,
          matricNumber: v.student.matricNumber,
          exam: v.exam.courseCode,
          examTitle: v.exam.title,
          date: v.date,
          time: v.time,
          severity: v.severity,
          aggregatedTypes: {}, 
          evidence: []
        });
      }

      const group = formattedViolationsMap.get(key);
      const typeKey = `${v.type}: ${v.message}`;
      group.aggregatedTypes[typeKey] = (group.aggregatedTypes[typeKey] || 0) + 1;
      group.evidence.push({
        id: v.id,
        type: v.type,
        message: v.message,
        time: v.time,
        date: v.date
      });
    });

    return NextResponse.json(Array.from(formattedViolationsMap.values()));
  } catch (error: any) {
    console.error("Fetch violations error:", error);
    return NextResponse.json({ error: "Failed to fetch violations" }, { status: 500 });
  }
}
