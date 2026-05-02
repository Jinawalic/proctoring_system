import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real application, you would save this to a database
    // For now, we'll just log it to the console
    console.log(`[VIOLATION LOGGED] Exam ID: ${data.examId}`, data.violation);

    return NextResponse.json({ success: true, message: 'Violation logged successfully' });
  } catch (error) {
    console.error('Error logging violation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log violation' },
      { status: 500 }
    );
  }
}
