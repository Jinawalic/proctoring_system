import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matricNumber, password } = body;

    const student = await prisma.student.findUnique({
      where: { matricNumber },
    });

    if (!student || student.password !== password) {
      return NextResponse.json({ error: "Invalid matric number or password" }, { status: 401 });
    }

    // In a real app, we would create a session/JWT here
    return NextResponse.json({ 
      message: "Login successful", 
      student: { id: student.id, name: student.name, email: student.email } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
