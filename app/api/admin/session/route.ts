import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
