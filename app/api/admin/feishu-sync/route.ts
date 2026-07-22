import { NextResponse } from "next/server";
import { syncFeishuContent } from "@/lib/feishu-sync/service";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimited = rateLimitRequest(request, "api:admin:feishu-sync", 6);

  if (rateLimited) {
    return rateLimited;
  }

  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const result = await syncFeishuContent({ source: "manual" });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync Feishu content." },
      { status: 503 }
    );
  }
}
