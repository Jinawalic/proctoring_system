import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId, examId } = await req.json();

    if (!studentId || !examId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await prisma.session.update({
      where: {
        studentId_examId: {
          studentId,
          examId
        }
      },
      data: {
        isInvalidated: true,
        status: "Invalidated"
      } as any
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Invalidate session error:", error);
    return NextResponse.json({ error: "Failed to invalidate session" }, { status: 500 });
  }
}
