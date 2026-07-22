import { NextResponse } from "next/server";
import { importMediaBatch } from "@/lib/admin/import-service";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (!files.length) {
      const singleFile = formData.get("file");

      if (singleFile instanceof File) {
        files.push(singleFile);
      }
    }

    if (!files.length) {
      return NextResponse.json({ error: "Missing media files." }, { status: 400 });
    }

    const result = await importMediaBatch(files);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import media batch." },
      { status: 400 }
    );
  }
}
