import { NextResponse } from "next/server";
import { buildProxiedTusLocation } from "@/lib/admin/tus-proxy";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type TusRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const forwardedHeaders = [
  "cache-control",
  "content-type",
  "tus-resumable",
  "upload-length",
  "upload-metadata",
  "upload-offset",
  "upload-defer-length",
  "upload-concat",
  "x-upsert"
];

function getTusConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey
  };
}

function copyRequestHeaders(request: Request, serviceRoleKey: string) {
  const headers = new Headers();

  for (const header of forwardedHeaders) {
    const value = request.headers.get(header);

    if (value) {
      headers.set(header, value);
    }
  }

  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("tus-resumable", request.headers.get("tus-resumable") ?? "1.0.0");

  return headers;
}

function rewriteLocationHeader(headers: Headers, upstreamBase: string) {
  const location = headers.get("location");

  if (!location) {
    return;
  }

  headers.set("location", buildProxiedTusLocation(location, upstreamBase));
}

async function proxyTusRequest(request: Request, context: TusRouteContext) {
  const rateLimited = rateLimitRequest(request, "api:admin:media:tus", 120);

  if (rateLimited) {
    return rateLimited;
  }

  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { path = [] } = await context.params;
    const { supabaseUrl, serviceRoleKey } = getTusConfig();
    const upstreamBase = `${supabaseUrl}/storage/v1/upload/resumable`;
    const upstreamUrl = path.length > 0 ? `${upstreamBase}/${path.map(encodeURIComponent).join("/")}` : upstreamBase;
    const init: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers: copyRequestHeaders(request, serviceRoleKey),
      cache: "no-store"
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    const response = await fetch(upstreamUrl, init);
    const headers = new Headers(response.headers);
    rewriteLocationHeader(headers, upstreamBase);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to proxy resumable upload." },
      { status: 503 }
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "tus-resumable": "1.0.0",
      "upload-length": "true",
      "upload-metadata": "true"
    }
  });
}

export const POST = proxyTusRequest;
export const PATCH = proxyTusRequest;
export const HEAD = proxyTusRequest;
