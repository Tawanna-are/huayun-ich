import { NextResponse } from "next/server";

type PlaybackEvent = {
  heritageId?: unknown;
  slug?: unknown;
  event?: unknown;
  videoUrl?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlaybackEvent;
    const heritageId = readString(body.heritageId);
    const slug = readString(body.slug);
    const event = readString(body.event);
    const videoUrl = readString(body.videoUrl);

    if (!heritageId || !slug || !videoUrl || (event !== "play" && event !== "ended")) {
      return NextResponse.json({ error: "Invalid playback event." }, { status: 422 });
    }

    console.info("heritage_video_playback", {
      heritageId,
      slug,
      event,
      videoUrl,
      at: new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record playback event." }, { status: 400 });
  }
}
