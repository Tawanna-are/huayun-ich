import { NextResponse } from "next/server";
import { validateContactSubmission } from "@/lib/engagement/validation";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CONTACT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const limited = rateLimitRequest(request, "contact-submission", 5, CONTACT_WINDOW_MS);
  if (limited) return limited;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = validateContactSubmission(payload);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const admin = await createSupabaseAdminClient();
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
    let userId: string | null = null;

    if (accessToken) {
      const { data } = await admin.auth.getUser(accessToken);
      userId = data.user?.id ?? null;
    }

    const cutoff = new Date(Date.now() - CONTACT_WINDOW_MS).toISOString();
    const { count, error: countError } = await admin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("email", validation.value.email)
      .gte("created_at", cutoff);

    if (countError) throw countError;
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "too_many_submissions" }, { status: 429 });
    }

    const { data, error } = await admin
      .from("contact_submissions")
      .insert({
        user_id: userId,
        heritage_item_id: validation.value.heritageItemId,
        kind: validation.value.kind,
        name: validation.value.name,
        email: validation.value.email,
        organization: validation.value.organization,
        message: validation.value.message,
        status: "new"
      })
      .select("id, status")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact submission:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "contact_unavailable" }, { status: 503 });
  }
}
