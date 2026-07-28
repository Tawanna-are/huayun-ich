import { describe, expect, it } from "vitest";
import {
  getLegalDocument,
  legalDocumentKeys,
  type LegalDocumentKey
} from "@/lib/legal/legal-content";

function documentText(key: LegalDocumentKey, locale: "zh" | "en") {
  const document = getLegalDocument(key, locale);
  return [
    document.title,
    document.description,
    document.intro,
    ...document.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs.flatMap((paragraph) =>
        paragraph.map((segment) => segment.text)
      )
    ])
  ].join(" ");
}

describe("legal content", () => {
  it("provides all four documents in Chinese and English", () => {
    expect(legalDocumentKeys).toEqual([
      "disclaimer",
      "privacy",
      "copyright",
      "terms"
    ]);

    for (const key of legalDocumentKeys) {
      for (const locale of ["zh", "en"] as const) {
        const document = getLegalDocument(key, locale);
        expect(document.title.length).toBeGreaterThan(3);
        expect(document.description.length).toBeGreaterThan(30);
        expect(document.intro.length).toBeGreaterThan(30);
        expect(document.sections.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("identifies the operator without publishing private contact details", () => {
    expect(documentText("terms", "zh")).toContain("华韵非遗网站运营方");
    expect(documentText("terms", "en")).toContain("Huayun Heritage Website Operator");

    for (const locale of ["zh", "en"] as const) {
      const allSegments = legalDocumentKeys.flatMap((key) =>
        getLegalDocument(key, locale).sections.flatMap((section) => section.paragraphs.flat())
      );
      expect(allSegments.some((segment) => segment.href === "/#contact")).toBe(true);
      expect(documentText("privacy", locale)).not.toMatch(/mailto:|@gmail\.com|street address/i);
    }
  });

  it("discloses cookies, website analytics, and Google Analytics in both languages", () => {
    const chinese = documentText("privacy", "zh");
    const english = documentText("privacy", "en");

    expect(chinese).toContain("Cookie");
    expect(chinese).toContain("访问统计");
    expect(chinese).toContain("Google Analytics");
    expect(english).toMatch(/cookies/i);
    expect(english).toMatch(/website analytics/i);
    expect(english).toContain("Google Analytics");
  });

  it("includes the approved copyright notice and rights-holder process", () => {
    const chinese = documentText("copyright", "zh");
    const english = documentText("copyright", "en");

    expect(chinese).toContain("本站尊重所有图片、文字及相关资料的知识产权");
    expect(chinese).toContain("部分文化资料来自公开信息整理，用于文化展示与交流");
    expect(chinese).toContain("请通过联系我们页面提交证明材料，我们将在核实后进行处理");
    expect(english).toContain("respects the intellectual property rights");
    expect(english).toContain("supporting evidence");
  });
});
