import { NextResponse } from "next/server";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { captureAppException } from "@/lib/monitoring/sentry";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { parseSearchRequest } from "@/lib/search/search-request";
import { searchHeritageItemsByIntent } from "@/lib/search/semantic-search";

export async function POST(request: Request) {
  const rateLimited = rateLimitRequest(request, "api:search", 60);

  if (rateLimited) {
    return rateLimited;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseSearchRequest(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const items = await getHeritageItems();
    const response = await searchHeritageItemsByIntent({
      query: parsed.query,
      items,
      locale: parsed.locale,
      category: parsed.category,
      province: parsed.province,
      limit: parsed.limit
    });

    return NextResponse.json({
      query: parsed.query,
      ...response
    });
  } catch (error) {
    captureAppException(error, {
      module: "api",
      operation: "search_route_post",
      tags: {
        locale: parsed.locale
      },
      extra: {
        query: parsed.query,
        category: parsed.category,
        province: parsed.province,
        limit: parsed.limit
      }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Semantic search request failed." },
      { status: 503 }
    );
  }
}
