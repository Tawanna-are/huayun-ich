# Homepage Streaming Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stream the homepage shell before Supabase resolves and reduce hydration to the mobile menu while keeping CMS reads live per request.

**Architecture:** Start one `getHeritageItems()` promise in the page and pass it to a server component inside Suspense. Keep the header server-rendered except for a small mobile-menu client island, and defer below-fold featured rendering with CSS containment.

**Tech Stack:** Next.js 15 App Router, React 19 Suspense, TypeScript, Tailwind CSS, Vitest, Lighthouse

---

### Task 1: Streaming Regression Contract

**Files:**
- Modify: `tests/home-cinematic-gallery.test.ts`
- Modify: `tests/home-featured-content.test.ts`

- [ ] Assert that the page creates `const itemsPromise = getHeritageItems()` without awaiting it, renders `Suspense`, and passes the promise to `HomeCmsContent`.
- [ ] Assert that `HomeCmsContent` awaits the promise and performs the existing tie-dye and featured selection.
- [ ] Run the focused tests and confirm failure before implementation.

### Task 2: Server-Streamed CMS Content

**Files:**
- Create: `components/home/home-cms-content.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] Move Hero/featured selection into async `HomeCmsContent({ itemsPromise })`.
- [ ] Keep `force-dynamic` and `noStore()` in the page.
- [ ] Render `<Suspense fallback={<HeroSection />}>` around `HomeCmsContent`.
- [ ] Run focused tests and confirm the streaming contract passes.

### Task 3: Mobile Menu Client Island

**Files:**
- Create: `components/home/home-mobile-menu.tsx`
- Modify: `components/home/home-header.tsx`
- Modify: `tests/home-cinematic-gallery.test.ts`

- [ ] Assert `home-header.tsx` has no `use client` or `useState` and renders `HomeMobileMenu`.
- [ ] Assert `home-mobile-menu.tsx` is a client component with the existing toggle labels and menu links.
- [ ] Move only mobile state and mobile navigation markup into `HomeMobileMenu`; keep desktop markup unchanged.
- [ ] Run focused tests and confirm the menu boundary passes.

### Task 4: Deferred Featured Rendering

**Files:**
- Modify: `components/home/featured-grid.tsx`
- Modify: `tests/home-cinematic-gallery.test.ts`

- [ ] Add source assertions for `content-visibility:auto` and `contain-intrinsic-size`.
- [ ] Add those containment utilities to the featured section without changing its children or styling.
- [ ] Run focused homepage tests.

### Task 5: Production and Lighthouse Verification

**Files:**
- No production changes expected.

- [ ] Run `npm.cmd run build`.
- [ ] Start the current production build on a fresh port.
- [ ] Verify desktop/mobile screenshots and mobile menu interaction.
- [ ] Run Lighthouse and report Performance, LCP, TBT, and document TTFB against the previous 74 / 3.5s / 640ms / 940ms reference.
