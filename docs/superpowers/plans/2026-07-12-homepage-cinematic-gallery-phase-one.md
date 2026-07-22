# 中国非遗首页 Cinematic Gallery 第一阶段 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有首页展示层改为带顶部胶囊导航、扎染大图 Hero 和四项 CMS 精选非遗的高级数字展馆首页。

**Architecture:** `app/[locale]/page.tsx` 保持服务端组件并调用现有 `getHeritageItems()`；首页专用导航和移动菜单独立为客户端组件，Hero 与精选模块保持展示组件。全局导航只在首页返回空，其余路由不变。

**Tech Stack:** Next.js 15、React 19、TypeScript、Tailwind CSS、next-intl、next/image、Vitest

---

## File Map

- Create `components/home/home-header.tsx`: 首页顶部胶囊导航与移动菜单。
- Modify `components/layout/site-header.tsx`: 首页隐藏全局导航，内页行为不变。
- Modify `components/home/hero-section.tsx`: CMS 扎染背景与纯中文展示型 Hero。
- Modify `components/home/featured-grid.tsx`: 四项展览式精选非遗卡片与空状态。
- Modify `app/[locale]/page.tsx`: 读取现有 CMS 数据并选择 Hero/精选内容。
- Modify `tests/home-single-screen.test.ts`: 第一阶段结构回归测试。

### Task 1: First-Phase Regression Test

**Files:**
- Modify: `tests/home-single-screen.test.ts`

- [ ] **Step 1: Replace the old single-screen assertions with failing first-phase assertions**

```ts
it("renders the cinematic gallery phase-one home", () => {
  const page = readFileSync("app/[locale]/page.tsx", "utf8");
  const hero = readFileSync("components/home/hero-section.tsx", "utf8");
  const featured = readFileSync("components/home/featured-grid.tsx", "utf8");

  expect(page).toContain("getHeritageItems");
  expect(page).toContain("items.slice(0, 4)");
  expect(page).toContain("<FeaturedGrid");
  expect(hero).toContain("中国非遗文化");
  expect(hero).toContain("探索千年传承的非遗技艺");
  expect(hero).not.toContain("ArcHeroCarousel");
  expect(hero).not.toContain("Button");
  expect(featured).toContain("精选非遗");
  expect(featured).toContain("item.categoryName");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- tests/home-single-screen.test.ts`

Expected: FAIL because the page does not load CMS items and the old Hero still imports `ArcHeroCarousel` and buttons.

### Task 2: Homepage Capsule Navigation

**Files:**
- Create: `components/home/home-header.tsx`
- Modify: `components/layout/site-header.tsx`
- Test: `tests/home-single-screen.test.ts`

- [ ] **Step 1: Add source assertions for homepage-only navigation**

```ts
const homeHeader = readFileSync("components/home/home-header.tsx", "utf8");
const siteHeader = readFileSync("components/layout/site-header.tsx", "utf8");
expect(homeHeader).toContain("中国非遗文化平台");
expect(homeHeader).toContain("非遗文化");
expect(homeHeader).toContain("传统技艺");
expect(homeHeader).toContain("文化探索");
expect(homeHeader).toContain("联系我们");
expect(siteHeader).toContain('pathname === "/"');
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- tests/home-single-screen.test.ts`

Expected: FAIL because `home-header.tsx` does not exist.

- [ ] **Step 3: Create `HomeHeader`**

Implement a client component using `useState`, `Menu`, `X`, `Link`, and the exact destinations:

```ts
const navItems = [
  { label: "非遗文化", href: "#featured" },
  { label: "传统技艺", href: "/heritage?category=traditional-craft" },
  { label: "文化探索", href: "/museum" },
  { label: "登录", href: "/login" },
  { label: "注册", href: "/login" },
  { label: "联系我们", href: "#contact" }
];
```

Use a desktop capsule and a mobile menu without changing authentication behavior.

- [ ] **Step 4: Hide `SiteHeader` only on the localized homepage**

Inside `SiteHeader`, after hooks execute:

```ts
if (pathname === "/") {
  return null;
}
```

- [ ] **Step 5: Run the test and verify GREEN for navigation**

Run: `npm.cmd test -- tests/home-single-screen.test.ts`

Expected: Navigation assertions pass.

### Task 3: Chinese Tie-Dye Hero

**Files:**
- Modify: `components/home/hero-section.tsx`
- Test: `tests/home-single-screen.test.ts`

- [ ] **Step 1: Replace the old Three.js Hero with a presentational image Hero**

Use this interface and fallback:

```ts
type HeroSectionProps = { imageSrc?: string };
const resolvedImage = imageSrc || "/assets/blue-tie-dye-hero.png";
```

Render `HomeHeader`, a `next/image` background with `priority`, a 48px desktop radius, a local white glass copy panel, the title `中国非遗文化`, and the two-line Chinese description. Do not render English copy or a CTA.

- [ ] **Step 2: Run the test and verify GREEN for Hero**

Run: `npm.cmd test -- tests/home-single-screen.test.ts`

Expected: Hero assertions pass and old carousel/button assertions are absent.

### Task 4: Four CMS Exhibition Cards

**Files:**
- Modify: `components/home/featured-grid.tsx`
- Test: `tests/home-single-screen.test.ts`

- [ ] **Step 1: Rebuild `FeaturedGrid` as a two-column exhibition grid**

Keep the existing `items: HeritageItem[]` prop. For each item render:

```tsx
<Link href={`/heritage/${item.slug}`}>
  <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 50vw, 100vw" />
  <span>{item.categoryName}</span>
  <h3>{item.name}</h3>
  <p>{item.summary}</p>
</Link>
```

Use a stable image aspect ratio, 24px to 32px radii, white card backgrounds, restrained shadows, line clamping, and an empty state when `items.length === 0`.

- [ ] **Step 2: Run the test and verify GREEN for Featured**

Run: `npm.cmd test -- tests/home-single-screen.test.ts`

Expected: All homepage source tests pass.

### Task 5: Server Data Composition

**Files:**
- Modify: `app/[locale]/page.tsx`
- Test: `tests/home-single-screen.test.ts`

- [ ] **Step 1: Load existing published CMS items**

```ts
const items = await getHeritageItems();
const tieDyePattern = /扎染|染色|tie[- ]?dye/i;
const heroItem = items.find((item) =>
  tieDyePattern.test([item.name, item.englishName, item.summary, ...item.tags].join(" "))
);
const featuredItems = items.slice(0, 4);
```

Render:

```tsx
<HeroSection imageSrc={heroItem?.image} />
<FeaturedGrid items={featuredItems} />
```

- [ ] **Step 2: Run homepage and spiral regression tests**

Run: `npm.cmd test -- tests/home-single-screen.test.ts tests/spiral-carousel-layout.test.ts`

Expected: PASS. The old spiral helper remains intact even though it is no longer loaded by the homepage.

### Task 6: Type, Build, and Browser Verification

**Files:**
- No production file changes expected.

- [ ] **Step 1: Run TypeScript validation**

Run: `npm.cmd run typecheck`

Expected: exit code 0.

- [ ] **Step 2: Run production build**

Run: `npm.cmd run build`

Expected: exit code 0 and `/zh`, `/en` generated.

- [ ] **Step 3: Start the production preview**

Run: `npm.cmd start -- -p 3050`

Expected: `http://localhost:3050/zh` returns HTTP 200.

- [ ] **Step 4: Verify with Playwright and screenshots**

Check desktop 1440x900 and mobile 390x844 for:

- one homepage capsule navigation and no global header duplication;
- no English Hero copy and no Hero CTA;
- CMS image or default tie-dye fallback visible;
- exactly four featured cards when four CMS items exist;
- mobile menu opens without overflow;
- first featured card navigates to `/zh/heritage/[slug]`;
- no console errors, horizontal overflow, or broken images.

## Repository Note

This project directory has no `.git` metadata, so worktree creation and commit checkpoints are unavailable. Preserve unrelated files and use test/build checkpoints instead.
