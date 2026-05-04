import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            student: true
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    console.error("Fetch exam results error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
