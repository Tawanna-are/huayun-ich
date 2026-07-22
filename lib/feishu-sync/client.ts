import type { FeishuAttachment, FeishuRecord } from "@/lib/feishu-sync/mapper";
import type { FeishuSyncConfig } from "@/lib/feishu-sync/config";

type FeishuApiResponse<T> = {
  code: number;
  msg?: string;
  data?: T;
};

type TokenData = {
  tenant_access_token: string;
  expire: number;
};

type TokenResponse = FeishuApiResponse<TokenData> & Partial<TokenData>;

type SearchRecordsResponse = {
  has_more?: boolean;
  page_token?: string;
  total?: number;
  items?: FeishuRecord[];
};

function trimBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

async function parseFeishuResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as FeishuApiResponse<T>;

  if (!response.ok || payload.code !== 0 || !payload.data) {
    throw new Error(payload.msg || `Feishu API request failed with ${response.status}.`);
  }

  return payload.data;
}

export class FeishuClient {
  private token: string | null = null;

  constructor(private readonly config: FeishuSyncConfig) {}

  async getTenantAccessToken() {
    if (this.token) {
      return this.token;
    }

    const response = await fetch(`${trimBaseUrl(this.config.baseUrl)}/auth/v3/tenant_access_token/internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret
      })
    });
    const payload = (await response.json()) as TokenResponse;

    if (!response.ok || payload.code !== 0) {
      throw new Error(payload.msg || `Feishu token request failed with ${response.status}.`);
    }

    this.token = payload.tenant_access_token ?? payload.data?.tenant_access_token ?? null;

    if (!this.token) {
      throw new Error("Feishu token response did not include tenant_access_token.");
    }

    return this.token;
  }

  async searchRecords(pageToken?: string) {
    const token = await this.getTenantAccessToken();
    const url = new URL(
      `${trimBaseUrl(this.config.baseUrl)}/bitable/v1/apps/${encodeURIComponent(this.config.appToken)}/tables/${encodeURIComponent(
        this.config.tableId
      )}/records/search`
    );

    url.searchParams.set("page_size", "500");

    if (pageToken) {
      url.searchParams.set("page_token", pageToken);
    }

    const body: Record<string, unknown> = {
      field_names: ["名称", "英文名称", "分类", "省份", "简介", "历史背景", "传承价值", "图片附件", "视频附件", "发布状态"]
    };

    if (this.config.viewId) {
      body.view_id = this.config.viewId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return parseFeishuResponse<SearchRecordsResponse>(response);
  }

  async listAllRecords() {
    const records: FeishuRecord[] = [];
    let pageToken: string | undefined;

    do {
      const page = await this.searchRecords(pageToken);
      records.push(...(page.items ?? []));
      pageToken = page.has_more ? page.page_token : undefined;
    } while (pageToken);

    return records;
  }

  async downloadAttachment(attachment: FeishuAttachment) {
    const directUrl = attachment.tmp_url ?? attachment.url;

    if (directUrl) {
      const response = await fetch(directUrl);

      if (!response.ok) {
        throw new Error(`Failed to download Feishu attachment ${attachment.name ?? ""}.`);
      }

      return await response.blob();
    }

    const token = await this.getTenantAccessToken();
    const fileToken = attachment.file_token ?? attachment.token;

    if (!fileToken) {
      throw new Error(`Feishu attachment ${attachment.name ?? ""} has no file token.`);
    }

    const response = await fetch(
      `${trimBaseUrl(this.config.baseUrl)}/drive/v1/medias/${encodeURIComponent(fileToken)}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download Feishu attachment ${attachment.name ?? ""}.`);
    }

    return await response.blob();
  }
}
