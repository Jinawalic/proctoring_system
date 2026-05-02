import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real application, you would calculate the score and save to a database
    // For now, we'll just log the submission
    console.log(`[EXAM SUBMITTED] Exam ID: ${data.examId}`, {
      answersCount: Object.keys(data.answers || {}).length,
      violationsCount: data.violationsCount
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      success: true, 
      message: 'Exam submitted successfully',
      receipt: `RCPT-${Date.now()}`
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
