# 中国非遗文化平台首页视觉升级：第一阶段设计

## 目标

在不改变 Next.js、React、TypeScript、Tailwind CSS、CMS、API、数据库和认证系统的前提下，将现有首页展示层升级为 Cinematic Gallery 风格的中国非遗数字展馆首页。

第一阶段只交付：

1. Hero 大图首屏
2. 首页顶部悬浮导航
3. 四项精选非遗

作品展示、首页 Footer 和其他内容模块留到第二阶段。

## 当前结构

- `app/[locale]/page.tsx` 当前只渲染 `HeroSection`。
- `components/home/hero-section.tsx` 当前包含静态扎染背景、Three.js 旋转图片和 CTA。
- `components/layout/site-header.tsx` 是所有页面共用的固定顶部导航。
- `components/home/featured-grid.tsx` 已存在但未在首页使用。
- `getHeritageItems()` 只返回 `published=true` 的 CMS 项目，并提供 `image`、`heroImage`、`summary`、`categoryName` 等首页所需字段。

## 视觉方案

### 首页画布

- 页面背景使用克制的浅灰绿色，不使用 SaaS 渐变或后台式容器。
- 主内容最大宽度为 1400px，保留 Apple 官网式留白。
- 卡片使用 24px 至 48px 大圆角和柔和阴影。

### 顶部导航

- 首页隐藏现有全局 `SiteHeader`，内页保持原导航不变。
- 首页新增白色半透明胶囊导航，位于 Hero 顶部并与 Hero 共用最大宽度。
- 左侧显示圆形“非”Logo 和“中国非遗文化平台”。
- 右侧显示：非遗文化、传统技艺、文化探索、登录、注册、联系我们。
- 登录和注册继续进入现有 `/login` 页面，不修改 Supabase 认证逻辑。
- 联系我们暂时指向第二阶段 Footer 的 `#contact` 锚点。
- 移动端收为 Logo、品牌名和菜单按钮，展开同一组入口。

### Hero

- 使用宽屏大圆角图片容器，桌面高度约 650px，移动端按屏宽收缩。
- 背景优先选择 CMS 中名称、标签或摘要包含“扎染”“染色”“tie-dye”的已发布项目 `image` 字段；没有匹配项目时使用 `/assets/blue-tie-dye-hero.png`。
- 不使用山水画，不使用黑色全屏遮罩。
- 文案位于局部半透明浅色玻璃面板内，保证不同图片上的可读性，同时保留影像质感。
- 主标题：中国非遗文化。
- 描述：探索千年传承的非遗技艺，感受中华传统文化的魅力与智慧。
- 不显示英文、CTA 按钮或原 Three.js 旋转图片。

### 精选非遗

- Hero 后增加“精选非遗”模块。
- 从 `getHeritageItems()` 返回的已发布内容中取前四项。
- 每张卡片包含 CMS 图片、中文标题、简短介绍和分类标签。
- 使用两列展览式卡片布局，移动端单列。
- 图片占主要视觉面积，文字区域保持留白；卡片链接到现有 `/heritage/[slug]`。

## 数据流

1. `app/[locale]/page.tsx` 在服务端调用现有 `getHeritageItems()`。
2. 页面从结果中选择扎染 Hero 项目，并取前四项作为精选内容。
3. `HeroSection` 只接收 Hero 图片地址。
4. `FeaturedGrid` 接收四个 `HeritageItem`。
5. 不增加新接口，不修改查询、表结构或 CMS 写入逻辑。

## 降级与异常

- CMS 无扎染项目：Hero 使用已有默认扎染图片。
- CMS 无任何项目：Hero 正常显示默认图，精选模块显示简洁空状态。
- CMS 图片加载失败：使用现有 Next.js 图片加载行为和背景色，页面结构不塌陷。
- 用户启用减少动态效果：关闭进入动画和图片缩放过渡。

## 响应式与性能

- 桌面验证 1440x900，移动端验证 390x844。
- Hero 使用 `next/image` 的 `fill`、响应式 `sizes` 和 `priority`。
- 精选卡片图片使用响应式 `sizes`，只加载四项。
- 首页不再加载 Three.js Hero，降低首屏 JavaScript 和 GPU 开销。

## 验证

- 新增首页结构回归测试：CMS 数据、Hero 中文文案、无 CTA、四项精选、首页专用导航。
- 运行专项 Vitest、TypeScript 类型检查和生产构建。
- 用真实浏览器检查 PC、移动端、导航展开、图片加载、卡片跳转、控制台错误和页面溢出。

## 明确不在第一阶段

- 作品展示
- 首页 Footer 重构
- 非遗影像
- 传承人故事
- 用户社区
- 新闻资讯
- 地图
- CMS、数据库、API、上传和认证逻辑修改
