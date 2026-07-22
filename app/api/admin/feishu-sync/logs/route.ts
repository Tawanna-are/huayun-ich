import { NextResponse } from "next/server";
import { getFeishuSyncLogs } from "@/lib/feishu-sync/service";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const logs = await getFeishuSyncLogs(10);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load Feishu sync logs." },
      { status: 503 }
    );
  }
}
