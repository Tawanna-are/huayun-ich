import { NextResponse } from "next/server";
import { reindexAssistantDocuments } from "@/lib/ai/assistant-indexer";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const result = await reindexAssistantDocuments();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reindex assistant documents." },
      { status: 503 }
    );
  }
}
