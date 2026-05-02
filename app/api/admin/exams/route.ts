import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: { examQuestions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Map the count to the questions field if needed, but schema has a 'questions' int field too.
    // For now, let's just return the exams.
    return NextResponse.json(exams);
  } catch (error: any) {
    console.error("Fetch exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, duration, questions } = body;

    if (!code || !name || !duration || !questions) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const parsedDuration = parseInt(duration);
    const parsedQuestions = parseInt(questions);

    if (isNaN(parsedDuration) || isNaN(parsedQuestions)) {
      return NextResponse.json({ error: "Duration and questions must be valid numbers" }, { status: 400 });
    }

    let exam;
    let retries = 0;
    while (retries < 2) {
      try {
        exam = await prisma.exam.create({
          data: {
            courseCode: code,
            title: name,
            duration: parsedDuration,
            questions: parsedQuestions,
            status: "Draft",
          },
        });
        break; // Success
      } catch (error: any) {
        if (error.message.includes("Can't reach database server") && retries < 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
          continue;
        }
        throw error; // Re-throw if not a connection error or out of retries
      }
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    console.error("Create exam error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Exam with this course code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create exam" }, { status: 500 });
  }
}
