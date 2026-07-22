import type { HeritageItem } from "@/lib/types/heritage";

export type DetailStoryLabels = {
  video: string;
  origin: string;
  craft: string;
  timeline: string;
  inheritor: string;
  related: string;
  inscription: string;
  galleryCount: string;
  timelineCount: string;
  profile: string;
};

export type VideoChapter = {
  id: string;
  href: `#${string}`;
  timecode: string;
  title: string;
  description: string;
};

export type StoryPanel = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
};

function fallbackText(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function createVideoChapters(item: HeritageItem, labels: DetailStoryLabels): VideoChapter[] {
  return [
    {
      id: "hero-video",
      href: "#hero-video",
      timecode: "00:00",
      title: labels.video,
      description: item.summary
    },
    {
      id: "story-origin",
      href: "#story-origin",
      timecode: "01:20",
      title: labels.origin,
      description: fallbackText(item.history[0], item.summary)
    },
    {
      id: "gallery",
      href: "#gallery",
      timecode: "02:40",
      title: labels.craft,
      description: fallbackText(item.gallery[0]?.caption, item.categoryName)
    },
    {
      id: "timeline",
      href: "#timeline",
      timecode: "03:30",
      title: labels.timeline,
      description: fallbackText(item.timeline[0]?.description, item.region)
    },
    {
      id: "inheritor",
      href: "#inheritor",
      timecode: "04:20",
      title: labels.inheritor,
      description: item.inheritor.title
    }
  ];
}

export function createStoryPanels(item: HeritageItem, labels: DetailStoryLabels): StoryPanel[] {
  const originBody = item.history.slice(0, 2).join("\n\n") || item.summary;
  const craftBody = [
    fallbackText(item.gallery[0]?.caption, item.summary),
    item.tags.length ? item.tags.join(" · ") : item.categoryName
  ].join("\n\n");
  const memoryBody = item.timeline
    .slice(0, 3)
    .map((event) => `${event.year} · ${event.title}：${event.description}`)
    .join("\n\n");

  return [
    {
      id: "story-origin",
      eyebrow: labels.origin,
      title: item.region,
      body: originBody,
      stat: String(item.inscriptionYear),
      statLabel: labels.inscription
    },
    {
      id: "story-craft",
      eyebrow: labels.craft,
      title: item.categoryName,
      body: craftBody,
      stat: String(item.gallery.length),
      statLabel: labels.galleryCount
    },
    {
      id: "story-memory",
      eyebrow: labels.timeline,
      title: item.timeline[0]?.title ?? labels.timeline,
      body: memoryBody || item.summary,
      stat: String(item.timeline.length),
      statLabel: labels.timelineCount
    },
    {
      id: "story-inheritor",
      eyebrow: labels.inheritor,
      title: item.inheritor.name,
      body: item.inheritor.bio,
      stat: item.inheritor.title,
      statLabel: labels.profile
    }
  ];
}
