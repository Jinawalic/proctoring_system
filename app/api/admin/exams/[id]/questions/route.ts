import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { text, options, correctOption } = body;

    const question = await prisma.question.create({
      data: {
        examId: id,
        text,
        options,
        correctOption,
      },
    });

    return NextResponse.json(question);
  } catch (error: any) {
    console.error("Add question error:", error);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await prisma.question.findMany({
      where: { examId: id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("Fetch questions error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
