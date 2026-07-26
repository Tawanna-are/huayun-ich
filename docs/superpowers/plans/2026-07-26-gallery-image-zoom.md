# Gallery Image Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible 1x-4x zoom, pan, mouse-wheel, and pinch gestures to the existing heritage image preview without changing gallery data or business actions.

**Architecture:** Keep dialog selection and accessibility in `CraftMediaGallery`. Add a focused `ZoomableImageViewer` client component for scale, pan, pointer, wheel, pinch, and toolbar behavior, backed by small pure geometry helpers that are easy to test.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons, Vitest

---

### Task 1: Zoom Geometry

**Files:**
- Create: `components/heritage/image-zoom-state.ts`
- Create: `tests/image-zoom-state.test.ts`

- [ ] **Step 1: Write failing scale and pan tests**

Test `clampScale` at values below 1, between limits, and above 4. Test `clampPan` at 1x and 2x with a fixed viewport so the image cannot leave the visible area.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- --run tests/image-zoom-state.test.ts`

Expected: FAIL because `image-zoom-state.ts` does not exist.

- [ ] **Step 3: Implement pure geometry helpers**

Export constants `MIN_IMAGE_SCALE = 1`, `MAX_IMAGE_SCALE = 4`, `IMAGE_SCALE_STEP = 0.5`, plus `clampScale(value)` and `clampPan({ x, y }, scale, viewport)`.

- [ ] **Step 4: Verify geometry tests pass**

Run: `npm test -- --run tests/image-zoom-state.test.ts`

Expected: all zoom-state tests PASS.

- [ ] **Step 5: Commit geometry work**

```bash
git add components/heritage/image-zoom-state.ts tests/image-zoom-state.test.ts
git commit -m "test: define gallery zoom geometry"
```

### Task 2: Zoomable Viewer

**Files:**
- Create: `components/heritage/zoomable-image-viewer.tsx`
- Create: `tests/zoomable-image-viewer.test.ts`

- [ ] **Step 1: Write failing viewer contract tests**

Assert that the component exposes zoom-in, zoom-out, and reset buttons; uses `WheelEvent`, pointer capture, two-pointer distance calculation, and a transform containing translate and scale; and imports the tested geometry helpers.

- [ ] **Step 2: Verify viewer tests fail**

Run: `npm test -- --run tests/zoomable-image-viewer.test.ts`

Expected: FAIL because the viewer component does not exist.

- [ ] **Step 3: Implement toolbar and zoom state**

Create props for image source, alt text, and localized labels. Store scale and pan state, disable controls at their limits, reset to centered 1x, and render Lucide `ZoomIn`, `ZoomOut`, and `RotateCcw` icons with titles and accessible labels.

- [ ] **Step 4: Implement pointer, wheel, and pinch interactions**

Use wheel delta to adjust scale, pointer capture for dragging above 1x, a map of active touch pointers for pinch distance, and geometry clamps after every update. Reset pan when scale returns to 1x.

- [ ] **Step 5: Verify viewer tests and typecheck**

Run: `npm test -- --run tests/image-zoom-state.test.ts tests/zoomable-image-viewer.test.ts`

Run: `npm run typecheck`

Expected: all targeted tests and TypeScript checks PASS.

- [ ] **Step 6: Commit viewer work**

```bash
git add components/heritage/zoomable-image-viewer.tsx tests/zoomable-image-viewer.test.ts
git commit -m "feat: add zoomable heritage image viewer"
```

### Task 3: Gallery Dialog Integration

**Files:**
- Modify: `components/heritage/craft-media-gallery.tsx`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Modify: `tests/heritage-media-experience.test.ts`

- [ ] **Step 1: Add failing integration assertions**

Require `CraftMediaGallery` to render `ZoomableImageViewer`, preserve `HeritageImageActions`, close handling, Escape behavior, focus restoration, and backdrop close. Require Chinese and English label objects to supply zoom-in, zoom-out, and reset text.

- [ ] **Step 2: Verify integration test fails**

Run: `npm test -- --run tests/heritage-media-experience.test.ts`

Expected: FAIL because the gallery still renders a static `Image` in the dialog.

- [ ] **Step 3: Replace only the dialog image region**

Pass the selected image into `ZoomableImageViewer`; place its toolbar beside the existing favorite, like, and close actions; retain the current dialog, backdrop, body scroll lock, and focus refs.

- [ ] **Step 4: Add bilingual control labels**

Chinese: `放大图片`, `缩小图片`, `还原图片大小`. English: `Zoom in`, `Zoom out`, `Reset zoom`.

- [ ] **Step 5: Verify integration and regression tests**

Run: `npm test -- --run tests/heritage-media-experience.test.ts tests/heritage-image-actions.test.ts`

Expected: all targeted gallery and image-action tests PASS.

- [ ] **Step 6: Commit integration**

```bash
git add components/heritage/craft-media-gallery.tsx app/[locale]/heritage/[slug]/page.tsx tests/heritage-media-experience.test.ts
git commit -m "feat: enable zoom in heritage image previews"
```

### Task 4: Full Verification

**Files:**
- Modify only if verification exposes a zoom-specific defect.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all test files PASS, including CMS, Feishu, uploads, comments, likes, and GA4.

- [ ] **Step 2: Run TypeScript validation**

Run: `npm run typecheck`

Expected: PASS with no errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: optimized build succeeds and all localized static pages generate.

- [ ] **Step 4: Inspect production preview**

Verify desktop mouse wheel, zoom controls, dragging, close/reset behavior, and focus restoration. Verify mobile pinch, drag, control fit, no overlap, and body scroll lock on `/zh/heritage/shu-embroidery` and `/en/heritage/shu-embroidery`.

- [ ] **Step 5: Merge and deploy**

Fast-forward the completed branch into `main`, push `origin main`, wait for Vercel `Ready`, and confirm the production detail dialog loads without console errors.
