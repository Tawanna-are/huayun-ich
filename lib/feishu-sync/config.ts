export type FeishuSyncConfig = {
  appId: string;
  appSecret: string;
  appToken: string;
  tableId: string;
  viewId: string | null;
  baseUrl: string;
};

export function getFeishuSyncConfig(): FeishuSyncConfig {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const appToken = process.env.FEISHU_BITABLE_APP_TOKEN;
  const tableId = process.env.FEISHU_BITABLE_TABLE_ID;

  if (!appId || !appSecret || !appToken || !tableId) {
    throw new Error("Missing Feishu sync environment variables.");
  }

  return {
    appId,
    appSecret,
    appToken,
    tableId,
    viewId: process.env.FEISHU_BITABLE_VIEW_ID || null,
    baseUrl: process.env.FEISHU_OPEN_BASE_URL || "https://open.feishu.cn/open-apis"
  };
}
