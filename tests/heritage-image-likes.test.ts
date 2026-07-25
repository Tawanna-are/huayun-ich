import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const HERITAGE_ID = "11111111-1111-4111-8111-111111111111";
const IMAGE_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";

type QueryResult = { data?: unknown; count?: number | null; error?: unknown };

class Query {
  filters: Array<[string, unknown]> = [];
  mutation: "select" | "upsert" | "delete" = "select";
  upsertValues?: unknown;
  upsertOptions?: unknown;

  constructor(
    readonly table: string,
    private readonly resolve: (query: Query) => QueryResult
  ) {}

  select() {
    this.mutation = "select";
    return this;
  }

  upsert(values: unknown, options: unknown) {
    this.mutation = "upsert";
    this.upsertValues = values;
    this.upsertOptions = options;
    return this;
  }

  delete() {
    this.mutation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  maybeSingle() {
    return Promise.resolve(this.resolve(this));
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return Promise.resolve(this.resolve(this)).then(onfulfilled, onrejected);
  }
}

let resolver: (query: Query) => QueryResult;
let queries: Query[];
let authUser: { id: string } | null;

const admin = {
  auth: {
    getUser: vi.fn(async () => ({ data: { user: authUser } }))
  },
  from: vi.fn((table: string) => {
    const query = new Query(table, resolver);
    queries.push(query);
    return query;
  })
};

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(async () => admin)
}));

function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function hasFilters(query: Query, filters: Array<[string, unknown]>) {
  return filters.every(([column, value]) =>
    query.filters.some(([actualColumn, actualValue]) => actualColumn === column && actualValue === value)
  );
}

describe("heritage image likes API", () => {
  beforeEach(() => {
    queries = [];
    authUser = null;
    resolver = (query) => {
      if (query.table === "media_assets") return { data: { id: IMAGE_ID }, error: null };
      if (query.table === "heritage_image_likes" && query.filters.some(([key]) => key === "user_id")) {
        return { data: null, error: null };
      }
      if (query.table === "heritage_image_likes") return { count: 0, error: null };
      return { data: null, error: null };
    };
    vi.clearAllMocks();
  });

  it("defines the route and queries heritage_image_likes through the admin client", () => {
    const route = readFileSync("app/api/engagement/image-likes/route.ts", "utf8");

    expect(route).toContain("createSupabaseAdminClient");
    expect(route).toContain('from("heritage_image_likes")');
    expect(route).toMatch(/export async function GET/);
    expect(route).toMatch(/export async function POST/);
  });

  it("rejects invalid GET UUID parameters", async () => {
    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(new Request(`http://localhost/api/engagement/image-likes?heritageItemId=nope&imageId=${IMAGE_ID}`));

    expect(response.status).toBe(400);
    expect(admin.from).not.toHaveBeenCalled();
  });

  it("returns count, liked and authenticated for an authenticated GET", async () => {
    authUser = { id: USER_ID };
    resolver = (query) => {
      if (query.table === "media_assets") return { data: { id: IMAGE_ID }, error: null };
      if (query.table === "heritage_image_likes" && hasFilters(query, [["user_id", USER_ID]])) {
        return { data: { id: "like-id" }, error: null };
      }
      if (query.table === "heritage_image_likes") return { count: 7, error: null };
      return { data: null, error: null };
    };

    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(
      new Request(`http://localhost/api/engagement/image-likes?heritageItemId=${HERITAGE_ID}&imageId=${IMAGE_ID}`, {
        headers: { authorization: "Bearer valid-token" }
      })
    );

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ count: 7, liked: true, authenticated: true });
    const likeQueries = queries.filter((query) => query.table === "heritage_image_likes");
    expect(likeQueries).toHaveLength(2);
    expect(likeQueries.every((query) => hasFilters(query, [["image_id", IMAGE_ID]]))).toBe(true);
    const assetQuery = queries.find((query) => query.table === "media_assets");
    expect(assetQuery && hasFilters(assetQuery, [["id", IMAGE_ID], ["heritage_id", HERITAGE_ID], ["file_type", "image"]])).toBe(true);
  });

  it("accepts an image belonging through heritage_media when media_assets has no match", async () => {
    resolver = (query) => {
      if (query.table === "media_assets") return { data: null, error: null };
      if (query.table === "heritage_media") return { data: { id: IMAGE_ID }, error: null };
      if (query.table === "heritage_image_likes") return { count: 2, error: null };
      return { data: null, error: null };
    };

    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(
      new Request(`http://localhost/api/engagement/image-likes?heritageItemId=${HERITAGE_ID}&imageId=${IMAGE_ID}`)
    );

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ count: 2, liked: false, authenticated: false });
    const legacyQuery = queries.find((query) => query.table === "heritage_media");
    expect(legacyQuery && hasFilters(legacyQuery, [["id", IMAGE_ID], ["heritage_item_id", HERITAGE_ID], ["media_type", "image"]])).toBe(true);
  });

  it("returns 404 when the image does not belong to the heritage item", async () => {
    resolver = (query) =>
      query.table === "media_assets" || query.table === "heritage_media"
        ? { data: null, error: null }
        : { count: 0, error: null };

    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(
      new Request(`http://localhost/api/engagement/image-likes?heritageItemId=${HERITAGE_ID}&imageId=${IMAGE_ID}`)
    );

    expect(response.status).toBe(404);
    await expect(responseBody(response)).resolves.toEqual({ error: "image_not_found" });
  });

  it("returns 503 instead of treating a media source query error as not found", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    resolver = (query) => {
      if (query.table === "media_assets") return { data: null, error: { message: "database details" } };
      if (query.table === "heritage_media") return { data: null, error: null };
      return { count: 0, error: null };
    };

    const { GET } = await import("@/app/api/engagement/image-likes/route");
    const response = await GET(
      new Request(`http://localhost/api/engagement/image-likes?heritageItemId=${HERITAGE_ID}&imageId=${IMAGE_ID}`)
    );

    expect(response.status).toBe(503);
    expect(JSON.stringify(await responseBody(response))).not.toContain("database details");
    consoleError.mockRestore();
  });

  it("requires authentication before processing POST", async () => {
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(
      new Request("http://localhost/api/engagement/image-likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: true })
      })
    );

    expect(response.status).toBe(401);
    await expect(responseBody(response)).resolves.toEqual({ error: "authentication_required" });
  });

  it("rejects invalid POST JSON, UUIDs and liked values", async () => {
    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const invalidJson = await POST(new Request("http://localhost/api/engagement/image-likes", { method: "POST", body: "{" }));
    const invalidPayload = await POST(
      new Request("http://localhost/api/engagement/image-likes", {
        method: "POST",
        body: JSON.stringify({ heritageItemId: HERITAGE_ID, imageId: "bad-id", liked: "yes" })
      })
    );

    expect(invalidJson.status).toBe(400);
    expect(invalidPayload.status).toBe(400);
  });

  it("upserts an authenticated image like and returns an image-scoped count", async () => {
    authUser = { id: USER_ID };
    resolver = (query) => {
      if (query.table === "media_assets") return { data: { id: IMAGE_ID }, error: null };
      if (query.mutation === "upsert") return { error: null };
      if (query.table === "heritage_image_likes") return { count: 4, error: null };
      return { data: null, error: null };
    };

    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(
      new Request("http://localhost/api/engagement/image-likes", {
        method: "POST",
        headers: { authorization: "Bearer valid-token", "content-type": "application/json" },
        body: JSON.stringify({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: true })
      })
    );

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ liked: true, count: 4 });
    const mutation = queries.find((query) => query.mutation === "upsert");
    expect(mutation?.upsertValues).toEqual({ user_id: USER_ID, heritage_item_id: HERITAGE_ID, image_id: IMAGE_ID });
    expect(mutation?.upsertOptions).toEqual({ onConflict: "user_id,image_id", ignoreDuplicates: true });
  });

  it("deletes an authenticated image like by user and image", async () => {
    authUser = { id: USER_ID };
    resolver = (query) => {
      if (query.table === "media_assets") return { data: { id: IMAGE_ID }, error: null };
      if (query.mutation === "delete") return { error: null };
      if (query.table === "heritage_image_likes") return { count: 1, error: null };
      return { data: null, error: null };
    };

    const { POST } = await import("@/app/api/engagement/image-likes/route");
    const response = await POST(
      new Request("http://localhost/api/engagement/image-likes", {
        method: "POST",
        headers: { authorization: "Bearer valid-token", "content-type": "application/json" },
        body: JSON.stringify({ heritageItemId: HERITAGE_ID, imageId: IMAGE_ID, liked: false })
      })
    );

    expect(response.status).toBe(200);
    const mutation = queries.find((query) => query.mutation === "delete");
    expect(mutation && hasFilters(mutation, [["user_id", USER_ID], ["image_id", IMAGE_ID]])).toBe(true);
  });
});
