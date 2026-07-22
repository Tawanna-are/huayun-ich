# 飞书多维表格内容同步

华韵内容可以从飞书多维表格同步到 Supabase，再由网站现有页面读取。

## 表字段

飞书多维表格需要包含：

- 名称
- 英文名称
- 分类
- 省份
- 简介
- 历史背景
- 传承价值
- 图片附件
- 视频附件
- 发布状态

## 环境变量

- `FEISHU_APP_ID`: 飞书开放平台自建应用 App ID。
- `FEISHU_APP_SECRET`: 飞书开放平台自建应用 App Secret。
- `FEISHU_BITABLE_APP_TOKEN`: 多维表格 app token。
- `FEISHU_BITABLE_TABLE_ID`: 数据表 table id。
- `FEISHU_BITABLE_VIEW_ID`: 可选，指定同步视图。
- `CRON_SECRET`: 定时同步接口鉴权密钥。

## 同步方式

- 后台 `/admin` 点击“立即同步飞书”会调用 `/api/admin/feishu-sync`。
- Vercel Cron 每 5 分钟调用 `/api/cron/feishu-sync`。
- Cron 请求必须带 `Authorization: Bearer CRON_SECRET`。

## 媒体同步

- 图片附件和视频附件会从飞书下载。
- 文件上传到 Supabase Storage 的 `heritage-media` bucket。
- 媒体记录写入 `heritage_media` 和 `media_assets`，详情页会自动展示。

## 增量规则

- 新飞书记录会创建非遗项目。
- 已同步记录会更新对应非遗项目。
- 飞书删除的记录只会影响已经存在 `feishu_record_mappings` 的内容，并将对应项目设为未发布。
- CMS 手动创建、且没有飞书映射的内容不会被飞书删除逻辑影响。

## 日志

同步日志写入 `feishu_sync_logs`，后台显示同步时间、新增数量、更新数量、删除数量和失败数量。
