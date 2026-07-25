import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const HERITAGE_ID = "11111111-1111-4111-8111-111111111111";
const IMAGE_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";

type AuthResult = {
  data: { user: { id: string } | null };
  error: unknown;
};

type RpcResult = {
  data: Array<{ exists: boolean; liked: boolean; count: number }> | null;
  error: unknown;
};

let authResult: AuthResult;
let rpcResult: RpcResult;
const rateLimitRequest = vi.fn((): Response | null => null);
const admin = {
  auth: { getUser: vi.fn(async (): Promise<AuthResult> => authResult) },
  rpc: vi.fn(async (): Promise<RpcResult> => rpcResult)
};

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(async () => admin)
}));

vi.mock("@/lib/security/rate-limit", () => ({ rateLimitRequest }));

function getRequest(token?: string) {
  return new Request(`http://localhost/api/engagement/image-likes?heritageItemId=${HERITAGE_ID}&imageId=${IMAGE_ID}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });
}

function postRequest(payload: unknown, token = "valid-token") {
  return new Request("http://localhost/api/engagement/image-likes", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("heritage image likes API", () => {
  beforeEach(() => {
    authResult = { data: { user: null }, error: null };
    rpcResult = { data: [{ exists: true, liked: false, count: 0 }], error: null };
    vi.clearAllMocks();
    rateLimitRequest.mockReturnValue(null);
  });

  it("uses one service-role RPC per request and no direct table queries", () => {
    const route = readFileSync("app/api/engagement/image-likes/route.ts", "utf8");

    expect(route).toContain("createSupabaseAdminClient");
    expect(route).toContain('rpc("get_heritage_image_like_state"');
    expect(route).toContain('rpc("set_heritage_image_like_state"');
    expect(route).not.toContain('.from("heritage_image_likes")');
    expect(route).not.toContain('.from("media_assets")');
    expect(route).not.toContain('.from("heritage_media")');
  });

  it("rate limits GET before validating UUID parameters", async () => {
    const limited = new Response(null, { status: 429 });
    rateLimitRequest.mockReturnValue(limited);
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(new Request("http://localhost/api/engagement/image-likes?heritageItemId=bad&imageId=bad"));

    expect(response).toBe(limited);
    expect(rateLimitRequest).toHaveBeenCalledWith(expect.any(Request), "heritage-image-likes:get", 120);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("rejects invalid GET UUID parameters", async () => {
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(new Request(`http://localhost/api/engagement/image-likes?heritageItemId=nope&imageId=${IMAGE_ID}`));

    expect(response.status).toBe(400);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("returns state from one GET RPC for an authenticated user", async () => {
    authResult = { data: { user: { id: USER_ID } }, error: null };
    rpcResult = { data: [{ exists: true, liked: true, count: 7 }], error: null };
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(getRequest("valid-token"));

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ count: 7, liked: true, authenticated: true });
    expect(admin.rpc).toHaveBeenCalledTimes(1);
    expect(admin.rpc).toHaveBeenCalledWith("get_heritage_image_like_state", {
      p_item_id: HERITAGE_ID,
      p_image_id: IMAGE_ID,
      p_user_id: USER_ID
    });
  });

  it("treats invalid GET credentials as an anonymous request", async () => {
    authResult = { data: { user: null }, error: { status: 401, message: "expired" } };
    rpcResult = { data: [{ exists: true, liked: false, count: 3 }], error: null };
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(getRequest("expired-token"));

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ count: 3, liked: false, authenticated: false });
    expect(admin.rpc).toHaveBeenCalledWith("get_heritage_image_like_state", expect.objectContaining({ p_user_id: null }));
  });

  it.each([{ status: 503, message: "auth unavailable" }, { message: "network unavailable" }])(
    "returns 503 for a GET auth service failure %#",
    async (error) => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      authResult = { data: { user: null }, error };
      const { GET } = await import("@/app/api/engagement/image-likes/route");
      const response = await GET(getRequest("token"));

      expect(response.status).toBe(503);
      expect(admin.rpc).not.toHaveBeenCalled();
      consoleError.mockRestore();
    }
  );

  it("returns 404 when the RPC hides an unpublished or unrelated image", async () => {
    rpcResult = { data: [{ exists: false, liked: false, count: 0 }], error: null };
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(getRequest());

    expect(response.status).toBe(404);
    await expect(responseBody(response)).resolves.toEqual({ error: "image_not_found" });
  });

  it("does not leak RPC errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    rpcResult = { data: null, error: { message: "private database details" } };
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(getRequest());

    expect(response.status).toBe(503);
    expect(JSON.stringify(await responseBody(response))).not.toContain("private database details");
    consoleError.mockRestore();
  });

  it("rate limits POST and checks for a bearer token before parsing JSON", async () => {
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const limited = new Response(null, { status: 429 });
    const json = vi.fn(async () => {
      throw new Error("body parsed");
    });
    rateLimitRequest.mockReturnValue(limited);
    const limitedResponse = await POST({ headers: new Headers(), json } as unknown as Request);

    expect(limitedResponse).toBe(limited);
    expect(rateLimitRequest).toHaveBeenCalledWith(expect.anything(), "heritage-image-likes:post", 20);
    expect(json).not.toHaveBeenCalled();

    rateLimitRequest.mockReturnValue(null);
    const noTokenResponse = await POST({ headers: new Headers(), json } as unknown as Request);
    expect(noTokenResponse.status).toBe(401);
    expect(json).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON, payload shapes, UUIDs and liked values", async () => {
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const invalidJson = await POST(
      new Request("http://localhost/api/engagement/image-likes", {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: "{"
      })
    );
    expect(invalidJson.status).toBe(400);

    for (const payload of [null, [], "invalid", 1, true, { heritageItemId: HERITAGE_ID, imageId: "bad", liked: "yes" }]) {
      const response = await POST(postRequest(payload));
      expect(response.status).toBe(400);
    }
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid POST credentials without calling the mutation RPC", async () => {
    authResult = { data: { user: null }, error: { status: 401, message: "expired" } };
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(postRequest({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: true }));

    expect(response.status).toBe(401);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("returns 503 for a POST auth service failure", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    authResult = { data: { user: null }, error: { status: 500, message: "auth unavailable" } };
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(postRequest({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: true }));

    expect(response.status).toBe(503);
    expect(admin.rpc).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("atomically mutates and counts through one POST RPC", async () => {
    authResult = { data: { user: { id: USER_ID } }, error: null };
    rpcResult = { data: [{ exists: true, liked: true, count: 4 }], error: null };
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(postRequest({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: true }));

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ liked: true, count: 4 });
    expect(admin.rpc).toHaveBeenCalledTimes(1);
    expect(admin.rpc).toHaveBeenCalledWith("set_heritage_image_like_state", {
      p_item_id: HERITAGE_ID,
      p_image_id: IMAGE_ID,
      p_user_id: USER_ID,
      p_liked: true
    });
  });

  it("returns 404 without exposing state when POST targets unpublished content", async () => {
    authResult = { data: { user: { id: USER_ID } }, error: null };
    rpcResult = { data: [{ exists: false, liked: false, count: 0 }], error: null };
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(postRequest({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: false }));

    expect(response.status).toBe(404);
  });
});
