# 华韵非遗首页现代化改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页改造成已确认的暖白现代非遗 Hero，只保留顶部导航、左侧品牌文案、右侧固定主视觉与三条无元数据视觉轨道，以及简洁联系入口。

**Architecture:** 保持 `app/[locale]/page.tsx` 的服务端取数和 `getHeritageItems()` 不变，由 `HomeCmsContent` 选择四个可用 CMS 项目并传给新的客户端 `HeritageExplorerHero`。视觉轨道只使用图片和详情链接，悬停或聚焦时展开自身，不切换固定主图，不渲染名称、地域、分类或简介。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Tailwind CSS、next-intl、Vitest、Next Image。

---

## File Map

- Create: `components/home/heritage-explorer-hero.tsx` - 客户端 Hero、固定主视觉、三条视觉轨道和响应式交互。
- Modify: `components/home/home-cms-content.tsx` - 选择四个有图片的 CMS 项目并移除旧精选、分类模块装配。
- Modify: `components/home/home-header.tsx` - 使用已确认的首页导航和轻量布局。
- Modify only if needed: `components/home/home-mobile-menu.tsx` - 适配新导航样式，不改变菜单行为。
- Modify: `components/home/hero-section.tsx` - 保留 Suspense fallback，但使其与新版 Hero 骨架一致。
- Create: `components/home/home-contact-entry.tsx` - 页面底部简洁联系入口。
- Modify: `tests/home-cinematic-gallery.test.ts` - 替换旧首页视觉合同。
- Modify: `tests/collection-visual-redesign.test.ts` - 删除旧分类索引装配断言。
- Modify: `tests/home-featured-content.test.ts` - 保留 CMS featured 数据合同，改为检查新版 Hero 数据装配。
- No change: CMS、Supabase、飞书同步、后台、内容仓储和非首页路由。

### Task 1: Lock the New Homepage Composition

**Files:**
- Modify: `tests/home-cinematic-gallery.test.ts`
- Modify: `tests/collection-visual-redesign.test.ts`
- Modify: `tests/home-featured-content.test.ts`

- [ ] **Step 1: Replace old source-contract assertions with the approved composition**

新增或调整断言，要求：

```ts
const content = readFileSync("components/home/home-cms-content.tsx", "utf8");
const explorer = readFileSync("components/home/heritage-explorer-hero.tsx", "utf8");
const header = readFileSync("components/home/home-header.tsx", "utf8");

expect(content).toContain("items.filter((item) => item.featured)");
expect(content).toContain("<HeritageExplorerHero");
expect(content).toContain("<HomeContactEntry");
expect(content).not.toContain("<FeaturedGrid");
expect(content).not.toContain("<CollectionCategoryIndex");
expect(content).not.toContain("Inheritor");

expect(explorer).toContain("让千年技艺");
expect(explorer).toContain("被世界看见");
expect(explorer).not.toContain("让千年技艺，");
expect(explorer).toContain('data-heritage-main-visual="true"');
expect(explorer).toContain('data-heritage-visual-rail="true"');
expect(explorer).toContain("image || item.heroImage");
expect(explorer).toContain("/heritage/${item.slug}");
expect(explorer).not.toContain("item.name");
expect(explorer).not.toContain("item.region");
expect(explorer).not.toContain("item.categoryName");
expect(explorer).not.toContain("item.summary");
expect(explorer).not.toContain("onMouseMove");

for (const label of ["首页", "传承文化", "非遗项目", "注册", "登录", "联系我们"]) {
  expect(header).toContain(label);
}
expect(header).not.toContain("传承故事");
expect(header).not.toContain("/inheritors");
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```text
npm test -- tests/home-cinematic-gallery.test.ts tests/collection-visual-redesign.test.ts tests/home-featured-content.test.ts
```

Expected: FAIL because `heritage-explorer-hero.tsx` and `home-contact-entry.tsx` do not exist and old modules are still mounted.

### Task 2: Build the Fixed Main Visual and Visual Rails

**Files:**
- Create: `components/home/heritage-explorer-hero.tsx`
- Test: `tests/home-cinematic-gallery.test.ts`

- [ ] **Step 1: Define the focused component contract**

```ts
type HeritageExplorerItem = Pick<HeritageItem, "slug" | "image" | "heroImage">;

type HeritageExplorerHeroProps = {
  mainItem?: HeritageExplorerItem;
  railItems: HeritageExplorerItem[];
};
```

The component must resolve images through:

```ts
function getDisplayImage(item: HeritageExplorerItem | undefined, fallback: string) {
  return item ? item.image || item.heroImage || fallback : fallback;
}
```

- [ ] **Step 2: Implement the approved Hero copy and layout**

Render the exact headline without punctuation:

```tsx
<h1>
  <span className="block whitespace-nowrap">让千年技艺</span>
  <span className="block whitespace-nowrap">被世界看见</span>
</h1>
```

Use a desktop `35% / 65%` grid, a fixed main visual and exactly three rail slots. Do not render project metadata over any image. Main visual and rails link to their existing detail routes.

- [ ] **Step 3: Implement accessible rail expansion without content switching**

Each rail must be a focusable `Link` with `data-heritage-visual-rail="true"`. Use CSS group hover and `focus-visible` width/translation rules so only the focused rail expands. Do not add React state, image swapping, mouse-position tracking or circular overlays.

- [ ] **Step 4: Add stable image failure fallback**

Wrap every image in a fixed-size container with a neutral green-gray background. Use Next Image for normal loading; when the CMS image string is absent, use existing `/assets/` fallback images before render so the layout never receives an empty `src`.

- [ ] **Step 5: Run the Hero contract test**

Run:

```text
npm test -- tests/home-cinematic-gallery.test.ts
```

Expected: Hero assertions PASS; composition assertions may remain RED until Task 3.

### Task 3: Wire Existing CMS Data Into the New Hero

**Files:**
- Modify: `components/home/home-cms-content.tsx`
- Modify: `components/home/hero-section.tsx`
- Create: `components/home/home-contact-entry.tsx`
- Test: `tests/home-featured-content.test.ts`
- Test: `tests/collection-visual-redesign.test.ts`

- [ ] **Step 1: Select image-capable featured items without changing the repository**

Use the already loaded `items`:

```ts
const featuredItems = items.filter((item) => item.featured);
const imageItems = [...featuredItems, ...items.filter((item) => !item.featured)].filter(
  (item, index, source) =>
    Boolean(item.image || item.heroImage) && source.findIndex((candidate) => candidate.id === item.id) === index
);
const [mainItem, ...railCandidates] = imageItems;
const railItems = railCandidates.slice(0, 3);
```

Pass only the required item fields through the component prop contract. Do not add an API request or hard-coded CMS slug.

- [ ] **Step 2: Replace old homepage module assembly**

Render:

```tsx
<>
  <HomeHeader />
  <HeritageExplorerHero mainItem={mainItem} railItems={railItems} />
  <HomeContactEntry />
</>
```

Remove `FeaturedGrid` and `CollectionCategoryIndex` imports and rendering from `HomeCmsContent`. Do not delete their component files because other work or tests may still reference them.

- [ ] **Step 3: Create the contact anchor without backend changes**

`HomeContactEntry` must render a lightweight section with `id="contact"`, a short cooperation sentence and an existing contact method or link. It must not submit a form or call a new API.

- [ ] **Step 4: Align the Suspense fallback**

Keep `HeroSection` export for `app/[locale]/page.tsx` fallback compatibility, but render a stable warm-white skeleton matching the new Hero dimensions. It must not reintroduce the old full-bleed museum image or old text.

- [ ] **Step 5: Run the three homepage suites**

Run:

```text
npm test -- tests/home-cinematic-gallery.test.ts tests/collection-visual-redesign.test.ts tests/home-featured-content.test.ts
```

Expected: all focused tests PASS.

### Task 4: Update the Homepage Navigation

**Files:**
- Modify: `components/home/home-header.tsx`
- Modify only if needed: `components/home/home-mobile-menu.tsx`
- Test: `tests/home-cinematic-gallery.test.ts`

- [ ] **Step 1: Replace navigation items with approved routes**

```ts
const primaryNav = [
  { label: "首页", href: "/" },
  { label: "传承文化", href: "/museum" },
  { label: "非遗项目", href: "/heritage" }
];
```

Keep `注册` and `登录` pointed at `/login`, and `联系我们` pointed at `#contact`. Do not add `/inheritors`.

- [ ] **Step 2: Apply the approved light navigation composition**

Use brand on the left, primary navigation centered, and account/contact actions on the right. Preserve `HomeMobileMenu` for small screens and pass it the same approved items.

- [ ] **Step 3: Run the header contract test**

Run:

```text
npm test -- tests/home-cinematic-gallery.test.ts
```

Expected: PASS.

### Task 5: Responsive and Accessibility Verification

**Files:**
- Modify if defects are found: `components/home/heritage-explorer-hero.tsx`
- Modify if defects are found: `components/home/home-header.tsx`
- Test: `tests/home-cinematic-gallery.test.ts`

- [ ] **Step 1: Verify semantic and keyboard contracts**

Check that every image link has an accessible label, all three rails are reachable by Tab, focus expansion does not obscure the next control, and reduced-motion styles disable scaling and translation.

- [ ] **Step 2: Run static verification**

Run one command at a time:

```text
npm test
npm run typecheck
npm run build
```

Expected: each exits `0`.

- [ ] **Step 3: Start the development server**

Run:

```text
npm run dev
```

Use the next available local port if port 3000 is occupied.

- [ ] **Step 4: Verify desktop at 1440px**

Confirm: two-line title, no Hero buttons, fixed main visual, three narrow rails, no overlaid metadata, no main-image switching, light page palette, and no horizontal overflow.

- [ ] **Step 5: Verify mobile at 390px**

Confirm: mobile menu contains only approved navigation, title stays within viewport, visual area has stable dimensions, rails remain usable without hover, contact section is reachable, and no text overlaps.

- [ ] **Step 6: Verify broken-image resilience**

Block one CMS image request or temporarily use browser request blocking. Confirm the corresponding visual retains its fixed size and neutral fallback background without affecting adjacent rails.

## Constraints

- The project directory is not a valid Git repository, so this plan contains no commit steps.
- Do not modify CMS, Supabase migrations, Feishu synchronization, admin routes, content repository contracts or non-home pages.
- Do not delete legacy homepage components during this task; only stop mounting them on the homepage.
