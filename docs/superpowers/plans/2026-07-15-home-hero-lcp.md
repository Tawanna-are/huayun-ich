# Home Hero LCP Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce homepage Hero mobile LCP below 2.5 seconds while preserving the current visual and CMS contract.

**Architecture:** Keep the server page and `HeroSection` interface intact. Optimize the existing local WebP source and make the `next/image` request hints accurately describe the rendered Hero width.

**Tech Stack:** Next.js 15, React 19, TypeScript, next/image, Vitest, Lighthouse

---

### Task 1: Loading Contract Regression

**Files:**
- Modify: `tests/home-cinematic-gallery.test.ts`

- [ ] Add assertions for `priority`, `fetchPriority="high"`, `quality={70}`, and responsive `calc(100vw - ...)` sizing.
- [ ] Run `npm.cmd test -- tests/home-cinematic-gallery.test.ts` and confirm the new assertions fail before production code changes.

### Task 2: Hero Image Request Hints

**Files:**
- Modify: `components/home/hero-section.tsx`

- [ ] Keep `fill`, `priority`, image source, alt text, crop classes, and animation classes unchanged.
- [ ] Add `fetchPriority="high"` and `quality={70}`.
- [ ] Replace `sizes` with `(min-width: 1440px) 1400px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 40px), calc(100vw - 24px)`.
- [ ] Run the focused test and confirm it passes.

### Task 3: WebP Compression

**Files:**
- Modify: `public/assets/tie-dye-craft-hero-v2.webp`

- [ ] Compress through `baoyu-compress-image` at quality 78 to a temporary WebP.
- [ ] Replace the source only if output is smaller and visually equivalent.
- [ ] Record byte reduction and inspect desktop/mobile screenshots.

### Task 4: Production and LCP Verification

**Files:**
- No production changes expected.

- [ ] Run focused homepage regression tests.
- [ ] Run `npm.cmd run build`.
- [ ] Start the production server on an unused port.
- [ ] Run mobile Lighthouse and record performance, FCP, LCP, TBT, CLS, and transfer size.
- [ ] Confirm LCP is below 2.5 seconds or report the remaining measured bottleneck.
