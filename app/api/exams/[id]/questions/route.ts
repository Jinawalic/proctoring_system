import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const questions = await prisma.question.findMany({
      where: { examId: id },
      select: {
        id: true,
        text: true,
        options: true,
        // Exclude correctOption for security
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("Fetch student questions error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
