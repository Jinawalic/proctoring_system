import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Fetch students error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, matricNumber } = body;

    if (!name || !email || !matricNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        matricNumber,
        password: "12345678", // Default password as per instructions
      },
    });

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Create student error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Student with this email or matric number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
