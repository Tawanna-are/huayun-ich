import { NextResponse } from "next/server";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

const statuses = new Set(["new", "in_progress", "resolved"]);
const kinds = new Set(["general", "supporter", "cooperation", "licensing"]);

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const requestedStatus = url.searchParams.get("status") ?? "new";
    const requestedKind = url.searchParams.get("kind");
    const status = statuses.has(requestedStatus) ? requestedStatus : "new";
    const supabase = await createSupabaseAdminClient();
    let query = supabase
      .from("contact_submissions")
      .select("id, kind, name, email, organization, message, status, created_at, heritage_item:heritage_items(name, english_name, slug)")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100);

    if (requestedKind && kinds.has(requestedKind)) query = query.eq("kind", requestedKind);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ submissions: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load submissions." }, { status: 503 });
  }
}
