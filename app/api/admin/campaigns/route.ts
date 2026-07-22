import { NextResponse } from "next/server";
import { getAdminCampaignConfigs } from "@/lib/admin/campaign-configs";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const campaigns = await getAdminCampaignConfigs();
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch campaign configs." },
      { status: 503 }
    );
  }
}
