import { prisma } from '../../../lib/prisma';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { examId, studentId, answers } = data;

    if (!examId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Fetch correct answers for score calculation
    const questions = await prisma.question.findMany({
      where: { examId },
      select: { id: true, correctOption: true, options: true }
    });

    let score = 0;
    const studentAnswers = answers || {};

    questions.forEach((q, idx) => {
      const studentSelectedOption = studentAnswers[idx];
      const correctOptionText = (q.options as string[])[q.correctOption];
      
      if (studentSelectedOption === correctOptionText) {
        score++;
      }
    });

    // Save or update the session
    const session = await prisma.session.upsert({
      where: {
        studentId_examId: {
          studentId,
          examId
        }
      },
      update: {
        answers: studentAnswers,
        score,
        submittedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        studentId,
        examId,
        answers: studentAnswers,
        score,
        submittedAt: new Date(),
      }
    });

    // Increment student completed exams count
    await prisma.student.update({
      where: { id: studentId },
      data: {
        completed: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Exam submitted successfully',
      sessionId: session.id,
      score,
      total: questions.length
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
