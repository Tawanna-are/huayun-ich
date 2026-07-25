import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdminClient = Awaited<ReturnType<typeof createSupabaseAdminClient>>;

function getAccessToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

async function imageBelongsToHeritage(admin: AdminClient, heritageItemId: string, imageId: string) {
  const [asset, legacyMedia] = await Promise.all([
    admin
      .from("media_assets")
      .select("id")
      .eq("id", imageId)
      .eq("heritage_id", heritageItemId)
      .eq("file_type", "image")
      .maybeSingle(),
    admin
      .from("heritage_media")
      .select("id")
      .eq("id", imageId)
      .eq("heritage_item_id", heritageItemId)
      .eq("media_type", "image")
      .maybeSingle()
  ]);

  if (asset.error) throw asset.error;
  if (legacyMedia.error) throw legacyMedia.error;
  return Boolean(asset.data || legacyMedia.data);
}

async function getLikeCount(admin: AdminClient, imageId: string) {
  const { count, error } = await admin
    .from("heritage_image_likes")
    .select("id", { count: "exact", head: true })
    .eq("image_id", imageId);

  if (error) throw error;
  return count ?? 0;
}

function unavailable(error: unknown, operation: "load" | "update") {
  console.error(`Failed to ${operation} image likes:`, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "image_likes_unavailable" }, { status: 503 });
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const heritageItemId = searchParams.get("heritageItemId")?.trim() ?? "";
  const imageId = searchParams.get("imageId")?.trim() ?? "";

  if (!uuidPattern.test(heritageItemId) || !uuidPattern.test(imageId)) {
    return NextResponse.json({ error: "invalid_image_like" }, { status: 400 });
  }

  try {
    const admin = await createSupabaseAdminClient();
    if (!(await imageBelongsToHeritage(admin, heritageItemId, imageId))) {
      return NextResponse.json({ error: "image_not_found" }, { status: 404 });
    }

    const accessToken = getAccessToken(request);
    let userId: string | null = null;
    if (accessToken) {
      const { data } = await admin.auth.getUser(accessToken);
      userId = data.user?.id ?? null;
    }

    const [count, ownLike] = await Promise.all([
      getLikeCount(admin, imageId),
      userId
        ? admin
            .from("heritage_image_likes")
            .select("id")
            .eq("user_id", userId)
            .eq("image_id", imageId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (ownLike.error) throw ownLike.error;
    return NextResponse.json({ count, liked: Boolean(ownLike.data), authenticated: Boolean(userId) });
  } catch (error) {
    return unavailable(error, "load");
  }
}

export async function POST(request: Request) {
  let rawPayload: unknown;
  try {
    rawPayload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (rawPayload === null || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return NextResponse.json({ error: "invalid_image_like" }, { status: 400 });
  }

  const payload = rawPayload as Record<string, unknown>;
  const heritageItemId = typeof payload.heritageItemId === "string" ? payload.heritageItemId.trim() : "";
  const imageId = typeof payload.imageId === "string" ? payload.imageId.trim() : "";
  if (!uuidPattern.test(heritageItemId) || !uuidPattern.test(imageId) || typeof payload.liked !== "boolean") {
    return NextResponse.json({ error: "invalid_image_like" }, { status: 400 });
  }

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  try {
    const admin = await createSupabaseAdminClient();
    const {
      data: { user }
    } = await admin.auth.getUser(accessToken);

    if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    if (!(await imageBelongsToHeritage(admin, heritageItemId, imageId))) {
      return NextResponse.json({ error: "image_not_found" }, { status: 404 });
    }

    const mutation = payload.liked
      ? admin.from("heritage_image_likes").upsert(
          { user_id: user.id, heritage_item_id: heritageItemId, image_id: imageId },
          { onConflict: "user_id,image_id", ignoreDuplicates: true }
        )
      : admin.from("heritage_image_likes").delete().eq("user_id", user.id).eq("image_id", imageId);
    const { error } = await mutation;

    if (error) throw error;
    return NextResponse.json({ liked: payload.liked, count: await getLikeCount(admin, imageId) });
  } catch (error) {
    return unavailable(error, "update");
  }
}
