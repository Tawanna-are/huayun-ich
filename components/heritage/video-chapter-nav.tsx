import { Play } from "lucide-react";
import type { VideoChapter } from "@/lib/content/heritage-storytelling";

type VideoChapterNavProps = {
  chapters: VideoChapter[];
  label: string;
};

export function VideoChapterNav({ chapters, label }: VideoChapterNavProps) {
  return (
    <nav
      aria-label={label}
      className="sticky top-[72px] z-30 border-y border-pine/10 bg-rice/86 text-ink shadow-[0_14px_40px_rgba(54,88,78,0.08)] backdrop-blur-xl"
    >
      <div className="museum-container flex gap-3 overflow-x-auto py-3">
        {chapters.map((chapter) => (
          <a
            key={chapter.id}
            href={chapter.href}
            className="group grid min-w-[210px] grid-cols-[auto_1fr] gap-3 rounded-md border border-pine/10 bg-paper/70 px-4 py-3 transition hover:-translate-y-0.5 hover:border-pine/28 hover:bg-paper"
          >
            <span className="mt-1 flex size-8 items-center justify-center rounded-full border border-pine/20 bg-mist text-pine">
              <Play className="size-3 fill-pine" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-cinnabar/72">
                {chapter.timecode}
              </span>
              <span className="mt-1 block truncate text-sm text-ink">{chapter.title}</span>
              <span className="mt-1 line-clamp-1 block text-xs text-ink/46">{chapter.description}</span>
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
