import { NextResponse } from "next/server";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ImageLikeState = {
  exists: boolean;
  liked: boolean;
  count: number;
};

function getAccessToken(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function isInvalidCredentialError(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return false;
  const status = (error as { status?: unknown }).status;
  return status === 400 || status === 401 || status === 403;
}

function parseState(data: unknown): ImageLikeState | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const value = row as Record<string, unknown>;
  const count = typeof value.count === "number" || typeof value.count === "string" ? Number(value.count) : Number.NaN;
  if (typeof value.exists !== "boolean" || typeof value.liked !== "boolean" || !Number.isFinite(count)) return null;
  return { exists: value.exists, liked: value.liked, count };
}

function unavailable(error: unknown, operation: "load" | "update") {
  console.error(`Failed to ${operation} image likes:`, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "image_likes_unavailable" }, { status: 503 });
}

export async function GET(request: Request) {
  const limited = rateLimitRequest(request, "heritage-image-likes:get", 120);
  if (limited) return limited;

  const searchParams = new URL(request.url).searchParams;
  const heritageItemId = searchParams.get("heritageItemId")?.trim() ?? "";
  const imageId = searchParams.get("imageId")?.trim() ?? "";
  if (!uuidPattern.test(heritageItemId) || !uuidPattern.test(imageId)) {
    return NextResponse.json({ error: "invalid_image_like" }, { status: 400 });
  }

  try {
    const admin = await createSupabaseAdminClient();
    const accessToken = getAccessToken(request);
    let userId: string | null = null;

    if (accessToken) {
      const authResult = await admin.auth.getUser(accessToken);
      if (authResult.error && !isInvalidCredentialError(authResult.error)) throw authResult.error;
      userId = authResult.data.user?.id ?? null;
    }

    const { data, error } = await admin.rpc("get_heritage_image_like_state", {
      p_item_id: heritageItemId,
      p_image_id: imageId,
      p_user_id: userId
    });
    if (error) throw error;

    const state = parseState(data);
    if (!state) throw new Error("Invalid image like state response");
    if (!state.exists) return NextResponse.json({ error: "image_not_found" }, { status: 404 });
    return NextResponse.json({ count: state.count, liked: state.liked, authenticated: Boolean(userId) });
  } catch (error) {
    return unavailable(error, "load");
  }
}

export async function POST(request: Request) {
  const limited = rateLimitRequest(request, "heritage-image-likes:post", 20);
  if (limited) return limited;

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

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

  try {
    const admin = await createSupabaseAdminClient();
    const authResult = await admin.auth.getUser(accessToken);
    if (authResult.error) {
      if (isInvalidCredentialError(authResult.error)) {
        return NextResponse.json({ error: "authentication_required" }, { status: 401 });
      }
      throw authResult.error;
    }

    const user = authResult.data.user;
    if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

    const { data, error } = await admin.rpc("set_heritage_image_like_state", {
      p_item_id: heritageItemId,
      p_image_id: imageId,
      p_user_id: user.id,
      p_liked: payload.liked
    });
    if (error) throw error;

    const state = parseState(data);
    if (!state) throw new Error("Invalid image like state response");
    if (!state.exists) return NextResponse.json({ error: "image_not_found" }, { status: 404 });
    return NextResponse.json({ liked: state.liked, count: state.count });
  } catch (error) {
    return unavailable(error, "update");
  }
}
