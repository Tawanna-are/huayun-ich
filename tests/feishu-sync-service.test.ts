import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildFeishuHeritagePayload,
  classifyFeishuAttachment,
  normalizeFeishuPublishStatus,
  slugifyFeishuHeritageName
} from "@/lib/feishu-sync/mapper";

describe("Feishu heritage sync service", () => {
  it("maps Feishu bitable fields into the existing heritage payload shape", () => {
    const payload = buildFeishuHeritagePayload({
      record_id: "recA",
      fields: {
        "名称": [{ text: "苏绣" }],
        "英文名称": "Su Embroidery",
        "分类": "传统工艺",
        "省份": "江苏",
        "简介": "以针为笔、以线为墨的江南刺绣艺术。",
        "历史背景": "起源于吴地民间刺绣。\n明清时期形成鲜明风格。",
        "传承价值": "体现江南审美与手工技艺体系。",
        "发布状态": "发布"
      },
      created_time: 1700000000000,
      last_modified_time: 1700000001000
    });

    expect(payload.slug).toBe("su-xiu");
    expect(payload.name).toBe("苏绣");
    expect(payload.englishName).toBe("Su Embroidery");
    expect(payload.categorySlug).toBe("traditional-craft");
    expect(payload.province).toBe("江苏");
    expect(payload.region).toBe("江苏");
    expect(payload.city).toBe("江苏");
    expect(payload.history).toEqual(["起源于吴地民间刺绣。", "明清时期形成鲜明风格。", "体现江南审美与手工技艺体系。"]);
    expect(payload.published).toBe(true);
  });

  it("normalizes publish states and stable slugs for imported content", () => {
    expect(normalizeFeishuPublishStatus("草稿")).toBe(false);
    expect(normalizeFeishuPublishStatus("未发布")).toBe(false);
    expect(normalizeFeishuPublishStatus(false)).toBe(false);
    expect(normalizeFeishuPublishStatus("发布")).toBe(true);
    expect(slugifyFeishuHeritageName("景德镇手工制瓷技艺")).toBe("jing-de-zhen-shou-gong-zhi-ci-ji-yi");
  });

  it("classifies Feishu attachments for Supabase Storage media sync", () => {
    expect(classifyFeishuAttachment({ name: "process.webp", file_token: "img-token", type: "image/webp" })).toBe("image");
    expect(classifyFeishuAttachment({ name: "interview.MOV", file_token: "video-token", type: "video/quicktime" })).toBe("video");
    expect(classifyFeishuAttachment({ name: "notes.pdf", file_token: "pdf-token", type: "application/pdf" })).toBeNull();
  });

  it("adds isolated Feishu client and sync orchestrator modules", () => {
    const clientPath = "lib/feishu-sync/client.ts";
    const servicePath = "lib/feishu-sync/service.ts";

    expect(existsSync(clientPath)).toBe(true);
    expect(existsSync(servicePath)).toBe(true);

    const clientSource = readFileSync(clientPath, "utf8");
    const serviceSource = readFileSync(servicePath, "utf8");

    expect(clientSource).toContain("tenant_access_token/internal");
    expect(clientSource).toContain("/bitable/v1/apps/");
    expect(clientSource).toContain("/records/search");
    expect(serviceSource).toContain("syncFeishuContent");
    expect(serviceSource).toContain("feishu_record_mappings");
    expect(serviceSource).toContain("media_assets");
    expect(serviceSource).toContain("heritage-media");
    expect(serviceSource).toContain("last_feishu_modified_time");
  });
});
