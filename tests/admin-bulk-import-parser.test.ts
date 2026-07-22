import { describe, expect, it } from "vitest";
import {
  parseCsvRecords,
  parseSpreadsheetFile,
  parseTimelineValue
} from "@/lib/admin/import-parser";
import {
  normalizeHeritageImportRows,
  summarizeImportPreview
} from "@/lib/admin/import-validation";

describe("bulk heritage import parsing and validation", () => {
  it("parses CSV files with quoted cells and list fields", async () => {
    const csv = [
      "slug,name,category_slug,summary,province,tags",
      'suzhou-embroidery,苏绣,traditional-craft,"以针代笔, 以线晕色",江苏,"刺绣,工艺"'
    ].join("\n");

    const rows = parseCsvRecords(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0].summary).toBe("以针代笔, 以线晕色");
    expect(rows[0].tags).toBe("刺绣,工艺");
  });

  it("recognizes Excel uploads through the spreadsheet parser contract", async () => {
    const file = new File([new Uint8Array([80, 75, 3, 4])], "heritage.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    await expect(parseSpreadsheetFile(file)).rejects.toThrow("XLSX");
  });

  it("parses timeline rows from compact text", () => {
    expect(parseTimelineValue("明代|形成|工艺体系成熟\n2006|入选|列入国家级名录")).toEqual([
      { year: "明代", title: "形成", description: "工艺体系成熟" },
      { year: "2006", title: "入选", description: "列入国家级名录" }
    ]);
  });

  it("validates required fields and deduplicates by slug and name/province", () => {
    const result = normalizeHeritageImportRows(
      [
        {
          slug: "suzhou-embroidery",
          name: "苏绣",
          category_slug: "traditional-craft",
          summary: "苏州刺绣",
          province: "江苏"
        },
        {
          slug: "suzhou-embroidery",
          name: "苏绣复制",
          category_slug: "traditional-craft",
          summary: "重复 slug",
          province: "江苏"
        },
        {
          slug: "another-suxiu",
          name: "苏绣",
          category_slug: "traditional-craft",
          summary: "重复名称地区",
          province: "江苏"
        },
        {
          slug: "",
          name: "缺少 slug",
          category_slug: "traditional-craft",
          summary: "无效",
          province: "江苏"
        }
      ],
      new Set(["traditional-craft"])
    );

    expect(result.rows[0].status).toBe("valid");
    expect(result.rows[1].status).toBe("duplicate");
    expect(result.rows[2].status).toBe("duplicate");
    expect(result.rows[3].status).toBe("invalid");
    expect(summarizeImportPreview(result.rows)).toMatchObject({
      totalRows: 4,
      validRows: 1,
      duplicateRows: 2,
      invalidRows: 1
    });
  });
});
