import { NextResponse } from "next/server";
import { syncFeishuContent } from "@/lib/feishu-sync/service";

export const runtime = "nodejs";

function verifyCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  try {
    const result = await syncFeishuContent({ source: "cron" });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run scheduled Feishu sync." },
      { status: 503 }
    );
  }
}
