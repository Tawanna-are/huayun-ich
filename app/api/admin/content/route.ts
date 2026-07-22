import { NextResponse } from "next/server";
import { getAdminCategories, getAdminHeritageRows } from "@/lib/admin/repository";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const [items, categories] = await Promise.all([getAdminHeritageRows(), getAdminCategories()]);
    return NextResponse.json({ items, categories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch admin content." },
      { status: 503 }
    );
  }
}
