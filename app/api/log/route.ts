import { prisma } from '../../../lib/prisma';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { examId, studentId, violation } = data;
    
    if (!examId || !studentId || !violation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const savedViolation = await prisma.violation.create({
      data: {
        studentId,
        examId,
        type: violation.type,
        message: violation.msg,
        severity: "Medium", // Default severity
        time: new Date(violation.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(violation.time).toISOString().split('T')[0],
      }
    });

    // Update or create session to reflect violation status
    await prisma.session.upsert({
      where: {
        studentId_examId: {
          studentId,
          examId
        }
      },
      update: {
        status: "Violation",
        updatedAt: new Date()
      },
      create: {
        studentId,
        examId,
        status: "Violation",
      }
    });

    return NextResponse.json({ success: true, violation: savedViolation });
  } catch (error) {
    console.error('Error logging violation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log violation' },
      { status: 500 }
    );
  }
}
