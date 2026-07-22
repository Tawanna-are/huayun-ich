import { NextResponse } from "next/server";
import {
  buildMediaLibraryFilters,
  deleteAdminMediaAssets,
  getAdminMediaLibrary,
  validateBulkDeleteMediaPayload
} from "@/lib/admin/media-library";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const filters = buildMediaLibraryFilters(new URL(request.url).searchParams);
    const library = await getAdminMediaLibrary(filters);
    return NextResponse.json(library);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch media library." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const validation = validateBulkDeleteMediaPayload(await request.json());

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const result = await deleteAdminMediaAssets(validation.ids);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete media assets." },
      { status: 503 }
    );
  }
}
