import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/admin/students/import
// Body: multipart/form-data with a "file" field (CSV)
// CSV must have headers: "Student Name", "Matric Number"
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or has no data rows" }, { status: 400 });
    }

    // Parse header row (case-insensitive, trimmed)
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h === "student name");
    const matricIdx = headers.findIndex((h) => h === "matric number");

    if (nameIdx === -1 || matricIdx === -1) {
      return NextResponse.json(
        {
          error:
            'CSV must have "Student Name" and "Matric Number" columns as headers.',
        },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const name = cols[nameIdx];
      const matricNumber = cols[matricIdx];

      if (!name || !matricNumber) {
        results.errors.push(`Row ${i + 1}: Missing name or matric number — skipped.`);
        continue;
      }

      // Validate matric number — must not be purely email-like (no "@")
      if (matricNumber.includes("@")) {
        results.errors.push(`Row ${i + 1}: "${matricNumber}" looks like an email, not a matric number — skipped.`);
        continue;
      }

      // Derive a deterministic placeholder email from the matric number
      const safeMatric = matricNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const email = `${safeMatric}@student.local`;

      try {
        // Use upsert so we never overwrite existing students' data
        const existing = await prisma.student.findUnique({ where: { matricNumber } });

        if (existing) {
          results.skipped++;
        } else {
          await prisma.student.create({
            data: {
              name,
              matricNumber,
              email,
              password: "12345678",
            },
          });
          results.created++;
        }
      } catch (err: any) {
        results.errors.push(`Row ${i + 1} (${matricNumber}): ${err.message}`);
      }
    }

    return NextResponse.json({
      message: `Import complete. ${results.created} created, ${results.skipped} skipped (already exist).`,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}
