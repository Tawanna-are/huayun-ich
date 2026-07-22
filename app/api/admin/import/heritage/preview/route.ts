import { NextResponse } from "next/server";
import { parseSpreadsheetFile } from "@/lib/admin/import-parser";
import { previewHeritageImport } from "@/lib/admin/import-service";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing import file." }, { status: 400 });
    }

    const records = await parseSpreadsheetFile(file);
    const preview = await previewHeritageImport(records);

    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to preview import." },
      { status: 400 }
    );
  }
}
