import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where: {
        status: "Active",
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(exams);
  } catch (error: any) {
    console.error("Fetch student exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
