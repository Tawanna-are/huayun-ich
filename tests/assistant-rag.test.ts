import { describe, expect, it } from "vitest";
import {
  buildAssistantSystemPrompt,
  createAssistantDocuments,
  createAssistantRecommendations,
  rankLocalAssistantDocuments
} from "@/lib/ai/assistant-rag";
import { createInheritorProfilesFromHeritageItems } from "@/lib/content/inheritor-repository";
import type { HeritageItem } from "@/lib/types/heritage";

function makeHeritageItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  return {
    id: "jingju",
    slug: "jingju",
    name: "Jingju",
    englishName: "Peking Opera",
    categorySlug: "traditional-opera",
    categoryName: "Traditional Opera",
    summary: "A highly stylized stage tradition from Beijing.",
    region: "Beijing",
    province: "Beijing",
    city: "Beijing",
    inscriptionYear: 2010,
    featured: false,
    image: "/assets/jingju.png",
    heroImage: "/assets/jingju-hero.png",
    videoPoster: "/assets/jingju-hero.png",
    videoUrl: "/assets/jingju.mp4",
    history: ["Formed through the fusion of court and folk theatre."],
    gallery: [],
    timeline: [{ year: "2010", title: "Inscribed", description: "Added to the representative list." }],
    inheritor: {
      name: "Mei school inheritor group",
      title: "Peking Opera representative inheritors",
      bio: "Keeps classic repertoires and performance training alive.",
      image: "/assets/inheritor-opera.png"
    },
    location: {
      lat: 39.9042,
      lng: 116.4074,
      mapX: 68,
      mapY: 31
    },
    tags: ["opera", "stage"],
    relatedSlugs: ["kunqu"],
    ...overrides
  };
}

describe("assistant RAG helpers", () => {
  it("creates searchable site documents for heritage, inheritors, categories and regions", () => {
    const items = [
      makeHeritageItem(),
      makeHeritageItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "Suzhou Embroidery",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "Traditional Craft",
        summary: "Fine silk embroidery from Suzhou with double-sided stitching.",
        region: "Suzhou",
        province: "Jiangsu",
        city: "Suzhou",
        inscriptionYear: 2006,
        tags: ["embroidery", "silk"],
        inheritor: {
          name: "Yao Jianping",
          title: "Representative Suzhou embroidery inheritor",
          bio: "Promotes portrait embroidery and double-sided embroidery.",
          image: "/assets/inheritor-craft.png"
        }
      })
    ];
    const profiles = createInheritorProfilesFromHeritageItems(items);
    const documents = createAssistantDocuments({ items, inheritors: profiles, locale: "en" });

    expect(documents.map((document) => document.sourceType)).toEqual(
      expect.arrayContaining(["heritage", "inheritor", "category", "region"])
    );
    expect(documents.find((document) => document.id === "heritage:suzhou-embroidery")?.content).toContain(
      "double-sided stitching"
    );
  });

  it("prioritizes matching site content and creates recommendation links", () => {
    const items = [
      makeHeritageItem(),
      makeHeritageItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "Suzhou Embroidery",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "Traditional Craft",
        summary: "Fine silk embroidery from Suzhou with double-sided stitching.",
        region: "Suzhou",
        province: "Jiangsu",
        city: "Suzhou",
        inscriptionYear: 2006,
        tags: ["embroidery", "silk"],
        inheritor: {
          name: "Yao Jianping",
          title: "Representative Suzhou embroidery inheritor",
          bio: "Promotes portrait embroidery and double-sided embroidery.",
          image: "/assets/inheritor-craft.png"
        }
      })
    ];
    const documents = createAssistantDocuments({
      items,
      inheritors: createInheritorProfilesFromHeritageItems(items),
      locale: "en"
    });
    const ranked = rankLocalAssistantDocuments("Recommend Suzhou embroidery inheritors and related region", documents);
    const recommendations = createAssistantRecommendations(ranked);

    expect(ranked[0]).toEqual(expect.objectContaining({ id: "heritage:suzhou-embroidery" }));
    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "heritage", href: "/heritage/suzhou-embroidery" }),
        expect.objectContaining({ type: "inheritor", href: expect.stringContaining("/inheritors/") }),
        expect.objectContaining({ type: "region", href: "/heritage?province=Jiangsu" })
      ])
    );
  });

  it("instructs the model to prioritize Huayun website context", () => {
    expect(buildAssistantSystemPrompt("en")).toContain("Prioritize Huayun website context");
    expect(buildAssistantSystemPrompt("zh")).toContain("优先使用华韵站内内容");
  });
});
