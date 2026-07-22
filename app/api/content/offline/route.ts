import { NextResponse } from "next/server";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createOfflineContentPayload } from "@/lib/content/multichannel-content";

export async function GET() {
  const items = await getHeritageItems();

  return NextResponse.json(createOfflineContentPayload(items), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
