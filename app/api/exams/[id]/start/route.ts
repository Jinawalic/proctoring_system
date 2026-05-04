import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    // Check if session already exists
    const existingSession = await prisma.session.findUnique({
      where: {
        studentId_examId: {
          studentId,
          examId
        }
      }
    });

    if (!existingSession) {
      // First time starting this exam
      await prisma.session.create({
        data: {
          studentId,
          examId,
          status: "Normal"
        }
      });

      // Increment enrolled count
      await prisma.student.update({
        where: { id: studentId },
        data: {
          enrolled: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Start exam error:", error);
    return NextResponse.json({ error: "Failed to start exam" }, { status: 500 });
  }
}
