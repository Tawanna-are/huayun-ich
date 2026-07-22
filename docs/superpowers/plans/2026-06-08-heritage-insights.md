# Heritage Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localized `/museum/insights` data visualization room with heat map, dynasty timeline, category statistics, and inheritance graph.

**Architecture:** Add a server-side insight aggregation module that converts `HeritageItem[]` into chart-ready data. Render the charts as lightweight SVG/server components and integrate the page with existing metadata, JSON-LD, sitemap, and museum styling.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl, Tailwind CSS, server-rendered SVG, Vitest.

---

### Task 1: Data Aggregation

**Files:**
- Create: `lib/content/heritage-insights.ts`
- Test: `tests/heritage-insights.test.ts`

- [ ] Write tests for province heat map groups, period timeline groups, category statistics, and inheritance graph nodes.
- [ ] Run `npm test -- tests/heritage-insights.test.ts` and confirm it fails because the module is missing.
- [ ] Implement `createHeritageInsights(items)` and helper types.
- [ ] Re-run the test and confirm it passes.

### Task 2: Visualization Components

**Files:**
- Create: `components/insights/heritage-heat-map.tsx`
- Create: `components/insights/dynasty-timeline-chart.tsx`
- Create: `components/insights/category-stat-chart.tsx`
- Create: `components/insights/inheritance-graph.tsx`
- Create: `components/insights/insights-overview.tsx`

- [ ] Build server-rendered SVG/CSS chart components with no `"use client"`.
- [ ] Keep text localized through props.
- [ ] Use stable dimensions and responsive wrappers.

### Task 3: Route and SEO

**Files:**
- Create: `app/[locale]/museum/insights/page.tsx`
- Modify: `app/sitemap.ts`
- Test: `tests/heritage-insights-page.test.ts`
- Modify: `tests/seo.test.ts`

- [ ] Add route structure tests for server rendering, metadata, JSON-LD, and insight aggregation.
- [ ] Add sitemap assertion for `/zh/museum/insights`.
- [ ] Implement localized route metadata and JSON-LD.
- [ ] Re-run route and SEO tests.

### Task 4: Full Verification

**Files:**
- No new feature files.

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] If a preview server is started, verify `/zh/museum/insights` returns 200.
