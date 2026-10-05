import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createHomeHeritageCards } from "@/lib/content/home-heritage-cards";
import type { HeritageItem } from "@/lib/types/heritage";

const item = {
  id: "heritage-1",
  slug: "ronghua",
  name: "绒花",
  englishName: "Velvet Flowers",
  image: "/cover.webp",
  heroImage: "/hero.webp",
  featured: false,
  gallery: [
    { id: "a", src: "/a.webp", alt: "A", caption: "A" },
    { id: "b", src: "/b.webp", alt: "B", caption: "B" }
  ],
  homeGallery: [{ id: "b", src: "/b.webp", alt: "B", caption: "B" }]
} as HeritageItem;

describe("homepage gallery selection", () => {
  it("keeps the cover and adds only selected gallery images with the same detail link", () => {
    const cards = createHomeHeritageCards([item]);

    expect(cards.map((card) => card.image)).toEqual(["/cover.webp", "/b.webp"]);
    expect(cards.map((card) => card.slug)).toEqual(["ronghua", "ronghua"]);
    expect(new Set(cards.map((card) => card.key)).size).toBe(2);
    expect(item.gallery).toHaveLength(2);
  });

  it("keeps existing homepage behavior when no gallery image is selected", () => {
    expect(createHomeHeritageCards([{ ...item, homeGallery: [] }]).map((card) => card.image)).toEqual(["/cover.webp"]);
  });

  it("renders each card at the existing detail URL and grid breakpoints", () => {
    const source = readFileSync("components/home/home-cms-content.tsx", "utf8");
    expect(source).toContain("createHomeHeritageCards(imageItems)");
    expect(source).toContain('href={`/heritage/${item.slug}`}');
    expect(source).toContain("grid-cols-2");
    expect(source).toContain("lg:grid-cols-4");
    expect(source).toContain("aspect-[4/5]");
  });
});
