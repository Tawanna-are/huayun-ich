# 多端发布第一阶段说明

## 已上线能力

第一阶段先不建设微信小程序，重点完成统一内容平台的 Web 侧基础设施：

- H5 活动页：`/zh/campaigns`、`/en/campaigns`、`/zh/campaigns/[slug]`、`/en/campaigns/[slug]`
- 多端内容 API：`/api/content`、`/api/content/campaigns`、`/api/content/offline`
- PWA 离线版：`/manifest.webmanifest`、`/sw.js`、`/zh/offline`、`/en/offline`

## 内容来源

所有内容继续来自现有 Supabase 内容库和 repository 层：

- `heritage_items`
- `categories`
- `inheritors`
- `media_assets`

多端内容整理逻辑集中在 `lib/content/multichannel-content.ts`，避免 H5、PWA 和未来小程序各自复制内容规则。

## H5 活动页

当前内置四个活动专题：

- 中国四大名绣
- 中国传统戏曲
- 中国茶文化
- 中国传统节庆

活动页会根据现有非遗项目的 slug、分类和关键词自动聚合关联项目。后续如果扩展为 CMS 配置，可以把 `campaignDefinitions` 迁移到 Supabase 表。

## PWA 缓存策略

`public/sw.js` 使用轻量缓存策略：

- Shell routes：安装时预缓存中英首页、名录、展馆、活动页和离线页。
- Offline payload：`/api/content/offline` 使用 network-first，网络可用时更新缓存。
- Images/assets：使用 cache-first，提升移动端重复访问速度。
- Navigation fallback：断网访问页面时回退到对应语言的 offline 页面。

Service worker 仅在 production 环境注册，开发环境不注册。

## API 说明

`GET /api/content`

返回统一多端内容 feed，包含：

- heritageItems
- categories
- campaigns
- inheritors

`GET /api/content/campaigns`

返回 H5 活动页专题列表。

`GET /api/content/offline`

返回 PWA 离线启动所需的轻量内容包。

## 下一步

第二阶段可接：

- H5 活动页后台配置
- 分享海报生成
- PWA 收藏离线缓存
- 小程序端复用 `/api/content` 和 `/api/content/campaigns`
