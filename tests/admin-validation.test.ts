import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  parseCommaList,
  parseLineList,
  parseTimelineText,
  validateCategoryPayload,
  validateHeritagePayload
} from "@/lib/admin/validation";

describe("admin content validation", () => {
  it("normalizes editor list fields", () => {
    expect(parseCommaList("京剧, 昆曲\n苏绣")).toEqual(["京剧", "昆曲", "苏绣"]);
    expect(parseLineList("第一段\n\n 第二段 ")).toEqual(["第一段", "第二段"]);
  });

  it("parses timeline editor rows", () => {
    expect(parseTimelineText("1790 | 徽班进京 | 徽班入京演出\n2010｜入选名录｜列入代表作名录")).toEqual([
      { year: "1790", title: "徽班进京", description: "徽班入京演出" },
      { year: "2010", title: "入选名录", description: "列入代表作名录" }
    ]);
  });

  it("validates heritage payloads before admin writes", () => {
    const result = validateHeritagePayload({
      slug: " jingju ",
      name: "京剧",
      englishName: "Peking Opera",
      categorySlug: "traditional-opera",
      summary: "京剧简介",
      region: "北京",
      province: "北京市",
      city: "北京",
      inscriptionYear: "2010",
      history: "历史第一段\n历史第二段",
      timeline: "1790 | 徽班进京 | 徽班入京演出",
      tags: "国粹, 剧场",
      relatedSlugs: "kunqu,datiehua",
      published: "true",
      featured: "true"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.slug).toBe("jingju");
      expect(result.data.inscriptionYear).toBe(2010);
      expect(result.data.history).toEqual(["历史第一段", "历史第二段"]);
      expect(result.data.timeline).toEqual([{ year: "1790", title: "徽班进京", description: "徽班入京演出" }]);
      expect(result.data.published).toBe(true);
      expect(result.data.featured).toBe(true);
    }
  });

  it("preserves advanced archive fields in the existing CMS payload", () => {
    const result = validateHeritagePayload({
      slug: "visual-collection-item",
      name: "Visual Collection Item",
      englishName: "Visual Collection Item",
      categorySlug: "traditional-craft",
      summary: "A short collection introduction.",
      region: "Jiangsu, Suzhou",
      province: "Jiangsu",
      city: "Suzhou",
      inscriptionYear: "2006",
      latitude: "31.2304",
      longitude: "121.4737",
      history: "First paragraph\nSecond paragraph",
      timeline: "2000 | Event | Description",
      tags: "craft, collection",
      relatedSlugs: "suzhou-embroidery",
      inheritorName: "Existing inheritor",
      inheritorTitle: "Representative inheritor",
      inheritorBio: "Existing biography"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.history).toEqual(["First paragraph", "Second paragraph"]);
      expect(result.data.timeline).toEqual([{ year: "2000", title: "Event", description: "Description" }]);
      expect(result.data.inscriptionYear).toBe(2006);
      expect(result.data.latitude).toBe(31.2304);
      expect(result.data.inheritorName).toBe("Existing inheritor");
    }
  });

  it("hides advanced archive inputs without changing full-form serialization", () => {
    const source = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(source).not.toContain('data-section="advanced-archive-fields"');
    expect(source).not.toContain('{ id: "editor"');
    expect(source).toContain("function rowToHeritageForm");
    expect(source).toContain("history:");
    expect(source).toContain("timeline:");
    expect(source).toContain("inheritorName:");
    expect(source).toContain("inscriptionYear:");
    expect(source).toContain("latitude:");
    expect(source).toContain("JSON.stringify(heritageForm)");
  });

  it("rejects invalid category payloads", () => {
    const result = validateCategoryPayload({
      slug: "bad slug",
      name: "",
      englishName: "Category",
      summary: "分类简介",
      color: "red"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.slug).toContain("小写字母");
      expect(result.errors.name).toContain("名称");
      expect(result.errors.color).toContain("HEX");
    }
  });
});
