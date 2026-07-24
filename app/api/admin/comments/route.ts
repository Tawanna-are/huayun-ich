import { NextResponse } from "next/server";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

const statuses = new Set(["pending", "approved", "rejected"]);

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const requestedStatus = new URL(request.url).searchParams.get("status") ?? "pending";
    const status = statuses.has(requestedStatus) ? requestedStatus : "pending";
    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("heritage_comments")
      .select("id, body, status, created_at, moderated_at, heritage_item:heritage_items(name, english_name, slug)")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ comments: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load comments." }, { status: 503 });
  }
}
