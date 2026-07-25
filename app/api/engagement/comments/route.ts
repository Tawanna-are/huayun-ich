import { NextResponse } from "next/server";
import { validateComment } from "@/lib/engagement/validation";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAccessToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

export async function GET(request: Request) {
  const heritageItemId = new URL(request.url).searchParams.get("heritageItemId")?.trim() ?? "";
  if (!uuidPattern.test(heritageItemId)) {
    return NextResponse.json({ error: "invalid_heritage_item" }, { status: 400 });
  }

  try {
    const admin = await createSupabaseAdminClient();
    const token = getAccessToken(request);
    const userResult = token ? await admin.auth.getUser(token) : { data: { user: null } };
    const userId = userResult.data.user?.id ?? null;
    const approvedQuery = admin
      .from("heritage_comments")
      .select("id, body, status, created_at")
      .eq("heritage_item_id", heritageItemId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    const ownQuery = userId
      ? admin
          .from("heritage_comments")
          .select("id, body, status, created_at")
          .eq("heritage_item_id", heritageItemId)
          .eq("user_id", userId)
          .neq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null });
    const [approved, own] = await Promise.all([approvedQuery, ownQuery]);

    if (approved.error) throw approved.error;
    if (own.error) throw own.error;
    return NextResponse.json({
      comments: approved.data ?? [],
      ownComments: own.data ?? [],
      authenticated: Boolean(userId)
    });
  } catch (error) {
    console.error("Failed to load comments:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "comments_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const limited = rateLimitRequest(request, "heritage-comments", 5);
  if (limited) return limited;

  let payload: { heritageItemId?: unknown; body?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const heritageItemId = typeof payload.heritageItemId === "string" ? payload.heritageItemId.trim() : "";
  const comment = validateComment(payload.body);
  if (!uuidPattern.test(heritageItemId) || !comment.ok) {
    return NextResponse.json({ error: "invalid_comment" }, { status: 400 });
  }

  const token = getAccessToken(request);
  if (!token) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  try {
    const admin = await createSupabaseAdminClient();
    const {
      data: { user }
    } = await admin.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

    const { data, error } = await admin
      .from("heritage_comments")
      .insert({ heritage_item_id: heritageItemId, user_id: user.id, body: comment.value, status: "pending" })
      .select("id, body, status, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "comments_unavailable" }, { status: 503 });
  }
}
