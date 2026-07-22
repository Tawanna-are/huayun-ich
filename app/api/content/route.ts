import { NextResponse } from "next/server";
import { getCategories, getHeritageItems } from "@/lib/content/heritage-repository";
import { getInheritorProfiles } from "@/lib/content/inheritor-repository";
import { createMultichannelContent } from "@/lib/content/multichannel-content";

export async function GET() {
  const [items, categories, inheritors] = await Promise.all([
    getHeritageItems(),
    getCategories(),
    getInheritorProfiles()
  ]);

  return NextResponse.json(createMultichannelContent({ items, categories, inheritors }), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
