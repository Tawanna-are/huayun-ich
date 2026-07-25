import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAccessToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

async function getLikeCount(admin: Awaited<ReturnType<typeof createSupabaseAdminClient>>, heritageItemId: string) {
  const { count, error } = await admin
    .from("heritage_likes")
    .select("id", { count: "exact", head: true })
    .eq("heritage_item_id", heritageItemId);

  if (error) throw error;
  return count ?? 0;
}

export async function GET(request: Request) {
  const heritageItemId = new URL(request.url).searchParams.get("heritageItemId")?.trim() ?? "";
  if (!uuidPattern.test(heritageItemId)) {
    return NextResponse.json({ error: "invalid_heritage_item" }, { status: 400 });
  }

  try {
    const admin = await createSupabaseAdminClient();
    const accessToken = getAccessToken(request);
    let userId: string | null = null;

    if (accessToken) {
      const { data } = await admin.auth.getUser(accessToken);
      userId = data.user?.id ?? null;
    }

    const [count, ownLike] = await Promise.all([
      getLikeCount(admin, heritageItemId),
      userId
        ? admin
            .from("heritage_likes")
            .select("id")
            .eq("user_id", userId)
            .eq("heritage_item_id", heritageItemId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (ownLike.error) throw ownLike.error;
    return NextResponse.json({ count, liked: Boolean(ownLike.data), authenticated: Boolean(userId) });
  } catch (error) {
    console.error("Failed to load likes:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "likes_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let payload: { heritageItemId?: unknown; liked?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const heritageItemId = typeof payload.heritageItemId === "string" ? payload.heritageItemId.trim() : "";
  if (!uuidPattern.test(heritageItemId) || typeof payload.liked !== "boolean") {
    return NextResponse.json({ error: "invalid_like" }, { status: 400 });
  }

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  try {
    const admin = await createSupabaseAdminClient();
    const {
      data: { user }
    } = await admin.auth.getUser(accessToken);

    if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

    const mutation = payload.liked
      ? admin.from("heritage_likes").upsert(
          { user_id: user.id, heritage_item_id: heritageItemId },
          { onConflict: "user_id,heritage_item_id", ignoreDuplicates: true }
        )
      : admin.from("heritage_likes").delete().eq("user_id", user.id).eq("heritage_item_id", heritageItemId);
    const { error } = await mutation;

    if (error) throw error;
    return NextResponse.json({ liked: payload.liked, count: await getLikeCount(admin, heritageItemId) });
  } catch (error) {
    console.error("Failed to update like:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "likes_unavailable" }, { status: 503 });
  }
}
