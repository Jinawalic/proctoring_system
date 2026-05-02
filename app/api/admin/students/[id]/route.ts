import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const student = await prisma.student.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Update student error:", error);
    return NextResponse.json({ error: error.message || "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error: any) {
    console.error("Delete student error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete student" }, { status: 500 });
  }
}
