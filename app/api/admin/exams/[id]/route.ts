import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Map frontend fields to database fields
    const updateData: any = {};
    if (body.code) updateData.courseCode = body.code;
    if (body.name) updateData.title = body.name;
    if (body.duration) {
      const parsed = parseInt(body.duration);
      if (isNaN(parsed)) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
      updateData.duration = parsed;
    }
    if (body.status) updateData.status = body.status;
    if (body.questions) {
      const parsed = parseInt(body.questions);
      if (isNaN(parsed)) return NextResponse.json({ error: "Invalid question count" }, { status: 400 });
      updateData.questions = parsed;
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(exam);
  } catch (error: any) {
    console.error("Update exam error:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error: any) {
    console.error("Delete exam error:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
