import { NextResponse } from "next/server";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: unknown };
    const allowed = ["new", "in_progress", "resolved"];
    if (typeof body.status !== "string" || !allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid submission status." }, { status: 422 });
    }

    const supabase = await createSupabaseAdminClient();
    const { error } = await supabase.from("contact_submissions").update({ status: body.status }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update submission." }, { status: 503 });
  }
}
