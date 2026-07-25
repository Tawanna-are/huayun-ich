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
    const allowed = ["approved", "rejected"];
    if (typeof body.status !== "string" || !allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid comment status." }, { status: 422 });
    }

    const supabase = await createSupabaseAdminClient();
    const { error } = await supabase
      .from("heritage_comments")
      .update({ status: body.status, moderated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to moderate comment." }, { status: 503 });
  }
}
