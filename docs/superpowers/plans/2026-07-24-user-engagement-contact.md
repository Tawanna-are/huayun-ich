# User Engagement and Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make registration useful by exposing favorites and history, adding authenticated likes and moderated comments, and providing a visitor-friendly contact/support application workflow with admin processing.

**Architecture:** Reuse the existing Supabase auth, favorites, history, profile, locale routing, and admin-session patterns. Add three isolated data domains (`heritage_likes`, `heritage_comments`, `contact_submissions`) behind focused repositories and API routes, then compose small client components into the current detail, profile, home, and admin pages without changing CMS or Feishu-sync ownership.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase/Postgres RLS, next-intl, Tailwind CSS, Vitest.

---

## File Map

- Create `supabase/migrations/20260724_user_engagement_contact.sql`: tables, constraints, indexes, RLS, and policies.
- Modify `supabase/schema.sql`: keep the canonical bootstrap schema aligned with the migration.
- Modify `lib/types/database.ts`: row/status/type contracts.
- Create `lib/engagement/validation.ts`: comment and contact normalization/validation.
- Create `lib/engagement/repository.ts`: public counts/comments and current-user state.
- Create `app/api/engagement/likes/route.ts`: authenticated toggle endpoint.
- Create `app/api/engagement/comments/route.ts`: public approved reads and authenticated pending writes.
- Create `app/api/contact/route.ts`: validated visitor submissions with rate limiting and honeypot rejection.
- Create `components/heritage/heritage-like-button.tsx`: like UI and sign-in redirect.
- Create `components/heritage/heritage-comments.tsx`: approved comments, pending state, and submit form.
- Create `components/contact/contact-application-form.tsx`: shared contact/support/cooperation form.
- Modify `components/home/home-contact-entry.tsx`: replace empty link with real form entry.
- Modify `app/[locale]/heritage/[slug]/page.tsx`: compose existing favorite/history with likes, comments, and support form.
- Modify `components/user/profile-dashboard.tsx`: add comments and submissions tabs/status lists.
- Modify `components/home/home-header.tsx` and `components/home/home-mobile-menu.tsx`: expose profile when authenticated without altering other navigation.
- Create `app/api/admin/comments/route.ts` and `app/api/admin/comments/[id]/route.ts`: moderation list/update.
- Create `app/api/admin/contact-submissions/route.ts` and `app/api/admin/contact-submissions/[id]/route.ts`: application list/update.
- Create `components/admin/engagement-admin-client.tsx`: two admin work queues.
- Modify `app/[locale]/admin/page.tsx`: mount the new work queues.
- Add focused tests under `tests/` for schema, validation, routes, UI integration, localization, and regression boundaries.

## Task 1: Lock Existing Favorites, History, and Profile Entry

**Files:**
- Modify: `components/home/home-header.tsx`
- Modify: `components/home/home-mobile-menu.tsx`
- Modify: `components/user/profile-dashboard.tsx`
- Test: `tests/user-engagement-entry.test.ts`

- [ ] **Step 1: Write a failing navigation/profile regression test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user engagement entry points", () => {
  it("keeps favorites and history and exposes profile navigation", () => {
    const profile = readFileSync("components/user/profile-dashboard.tsx", "utf8");
    const header = readFileSync("components/home/home-header.tsx", "utf8");
    expect(profile).toContain("user_favorites");
    expect(profile).toContain("user_browsing_history");
    expect(header).toContain('href="/profile"');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails on the missing profile link**

Run: `npm test -- tests/user-engagement-entry.test.ts`

Expected: FAIL because the homepage header has no `/profile` link.

- [ ] **Step 3: Add a locale-aware personal-center entry without removing current links**

Use the existing `Link` component and bilingual copy. Preserve 首页、非遗项目、注册、登录、联系我们 and the English equivalents; when session-aware rendering is unavailable in the server header, add an explicit personal-center entry adjacent to login rather than duplicating auth state logic.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- tests/user-engagement-entry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/home/home-header.tsx components/home/home-mobile-menu.tsx components/user/profile-dashboard.tsx tests/user-engagement-entry.test.ts
git commit -m "feat: expose member collection and history"
```

## Task 2: Add Engagement Database Schema

**Files:**
- Create: `supabase/migrations/20260724_user_engagement_contact.sql`
- Modify: `supabase/schema.sql`
- Modify: `lib/types/database.ts`
- Test: `tests/user-engagement-schema.test.ts`

- [ ] **Step 1: Write a failing schema contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260724_user_engagement_contact.sql", "utf8");

describe("engagement schema", () => {
  it.each(["heritage_likes", "heritage_comments", "contact_submissions"])("creates %s", (table) => {
    expect(sql).toContain(`create table if not exists public.${table}`);
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  });
  it("prevents duplicate likes and defaults comments to pending", () => {
    expect(sql).toMatch(/unique\s*\(user_id,\s*heritage_item_id\)/i);
    expect(sql).toMatch(/status text not null default 'pending'/i);
  });
});
```

- [ ] **Step 2: Run the schema test**

Run: `npm test -- tests/user-engagement-schema.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Create tables, constraints, indexes, and RLS**

The migration must define:

```sql
create table if not exists public.heritage_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, heritage_item_id)
);

create table if not exists public.heritage_comments (
  id uuid primary key default gen_random_uuid(),
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 800),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_at timestamptz
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  heritage_item_id uuid references public.heritage_items(id) on delete set null,
  kind text not null check (kind in ('general','supporter','cooperation','licensing')),
  name text not null,
  email text not null,
  organization text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Add user-owned like policies, user insert/select-own comment policies, approved-comment public reads, and no public policy for contact submissions. Mirror definitions in `supabase/schema.sql` and add matching TypeScript row/status unions.

- [ ] **Step 4: Run schema and existing user-schema tests**

Run: `npm test -- tests/user-engagement-schema.test.ts tests/user-system-schema.test.ts tests/user-types.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260724_user_engagement_contact.sql supabase/schema.sql lib/types/database.ts tests/user-engagement-schema.test.ts
git commit -m "feat: add engagement and contact schema"
```

## Task 3: Implement Validation and Public Contact Submission

**Files:**
- Create: `lib/engagement/validation.ts`
- Create: `app/api/contact/route.ts`
- Test: `tests/contact-submission-validation.test.ts`
- Test: `tests/contact-submission-route.test.ts`

- [ ] **Step 1: Write failing validation tests**

```ts
import { describe, expect, it } from "vitest";
import { validateContactSubmission } from "@/lib/engagement/validation";

describe("contact validation", () => {
  it("accepts a valid visitor submission", () => {
    expect(validateContactSubmission({ kind: "supporter", name: "Lin", email: "lin@example.com", message: "I want to help document this craft.", consent: true, website: "" }).ok).toBe(true);
  });
  it("rejects invalid email, missing consent, and honeypot content", () => {
    expect(validateContactSubmission({ kind: "general", name: "A", email: "bad", message: "hello", consent: false, website: "bot" }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- tests/contact-submission-validation.test.ts`

Expected: FAIL because the validator does not exist.

- [ ] **Step 3: Implement strict normalization and validation**

Export `validateContactSubmission(input)` returning `{ ok: true, value } | { ok: false, error }`. Enforce allowed kinds, 2-80 character name, valid email, optional organization up to 120 characters, message 10-2000 characters, required consent, and an empty `website` honeypot.

- [ ] **Step 4: Implement `POST /api/contact`**

Use the server Supabase/admin-client pattern already used by protected server routes. Resolve the optional user from the request session, reject more than three submissions from the same normalized email within ten minutes, insert only validated fields, and return `201 { id, status: "new" }`. Return `400`, `429`, or `503` with bilingual-neutral error codes that the client maps to localized copy.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- tests/contact-submission-validation.test.ts tests/contact-submission-route.test.ts tests/rate-limit.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/engagement/validation.ts app/api/contact/route.ts tests/contact-submission-validation.test.ts tests/contact-submission-route.test.ts
git commit -m "feat: accept validated contact applications"
```

## Task 4: Add Authenticated Likes

**Files:**
- Create: `lib/engagement/repository.ts`
- Create: `app/api/engagement/likes/route.ts`
- Create: `components/heritage/heritage-like-button.tsx`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Test: `tests/heritage-likes.test.ts`

- [ ] **Step 1: Write failing route and UI contract tests**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage likes", () => {
  it("requires auth and uses a unique user/item toggle", () => {
    const route = readFileSync("app/api/engagement/likes/route.ts", "utf8");
    expect(route).toContain("getUser");
    expect(route).toContain("heritage_likes");
  });
  it("mounts the like button without removing favorite/history", () => {
    const page = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");
    expect(page).toContain("HeritageLikeButton");
    expect(page).toContain("FavoriteButton");
    expect(page).toContain("BrowsingHistoryTracker");
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- tests/heritage-likes.test.ts`

Expected: FAIL because the route and component do not exist.

- [ ] **Step 3: Implement repository count/state helpers and toggle route**

`POST /api/engagement/likes` accepts `{ heritageItemId, liked }`, requires `supabase.auth.getUser()`, inserts with the unique key when liked, deletes the current user's row when unliked, and returns the fresh count. Never accept a `userId` from the client.

- [ ] **Step 4: Implement the localized like button**

The component receives `itemId`, `initialCount`, and `initialLiked`. It optimistically updates, rolls back on failure, routes unauthenticated users to `/${locale}/login`, exposes `aria-pressed`, and uses the existing Lucide `Heart` icon and current detail-page button styling.

- [ ] **Step 5: Compose into the existing detail action area**

Do not change images, media, copy, CMS fields, or section order. Place the like button beside the existing favorite button and support trigger.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test -- tests/heritage-likes.test.ts tests/user-integration.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/engagement/repository.ts app/api/engagement/likes/route.ts components/heritage/heritage-like-button.tsx app/[locale]/heritage/[slug]/page.tsx tests/heritage-likes.test.ts
git commit -m "feat: add authenticated heritage likes"
```

## Task 5: Add Moderated Comments

**Files:**
- Create: `app/api/engagement/comments/route.ts`
- Create: `components/heritage/heritage-comments.tsx`
- Modify: `lib/engagement/validation.ts`
- Modify: `lib/engagement/repository.ts`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Test: `tests/heritage-comments.test.ts`

- [ ] **Step 1: Write failing moderation tests**

```ts
import { describe, expect, it } from "vitest";
import { validateComment } from "@/lib/engagement/validation";

describe("moderated comments", () => {
  it("normalizes plain text and enforces length", () => {
    expect(validateComment("  useful observation  ")).toEqual({ ok: true, value: "useful observation" });
    expect(validateComment("x")).toMatchObject({ ok: false });
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- tests/heritage-comments.test.ts`

Expected: FAIL because comment validation does not exist.

- [ ] **Step 3: Implement comment reads and pending writes**

`GET` returns approved comments for an item plus the signed-in user's own pending/rejected comments. `POST` requires auth, validates 2-800 plain-text characters, and always inserts `status: "pending"`; ignore any client-provided status.

- [ ] **Step 4: Build the comments component**

Render approved comments in chronological groups, a login prompt for guests, a submit form for members, a pending badge for the member's own new comment, empty/loading/error states, and Chinese/English strings. Render body as text, never HTML.

- [ ] **Step 5: Add it below the existing detail narrative**

Mount `HeritageComments` before the final consultation/cooperation section. Preserve all current heritage sections and media.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `npm test -- tests/heritage-comments.test.ts tests/heritage-detail-museum.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/api/engagement/comments/route.ts components/heritage/heritage-comments.tsx lib/engagement/validation.ts lib/engagement/repository.ts app/[locale]/heritage/[slug]/page.tsx tests/heritage-comments.test.ts
git commit -m "feat: add moderated heritage comments"
```

## Task 6: Replace the Empty Contact Entry with the Shared Form

**Files:**
- Create: `components/contact/contact-application-form.tsx`
- Modify: `components/home/home-contact-entry.tsx`
- Modify: `components/home/home-cms-content.tsx`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Test: `tests/contact-application-ui.test.ts`

- [ ] **Step 1: Write a failing UI integration test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contact application UI", () => {
  it("uses the shared form on home and heritage pages", () => {
    const home = readFileSync("components/home/home-contact-entry.tsx", "utf8");
    const detail = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");
    expect(home).toContain("ContactApplicationForm");
    expect(detail).toContain("ContactApplicationForm");
    expect(home).not.toContain('href="/heritage"');
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- tests/contact-application-ui.test.ts`

Expected: FAIL because the current contact entry links to `/heritage`.

- [ ] **Step 3: Build the shared accessible form**

Implement name, email, kind, organization, message, consent, and hidden `website` fields. Support optional `heritageItemId`, `heritageItemName`, and `defaultKind="supporter"`. Map API error codes to bilingual feedback and disable only during submission.

- [ ] **Step 4: Replace homepage empty entry and wire detail support trigger**

Use the existing light paper background and restrained green/red palette. Do not alter homepage hero, cards, images, or CMS queries. On detail pages, opening “成为传承支持者” shows the same form with the item preselected.

- [ ] **Step 5: Run focused home/detail tests**

Run: `npm test -- tests/contact-application-ui.test.ts tests/home-featured-content.test.ts tests/heritage-commercial-detail.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/contact/contact-application-form.tsx components/home/home-contact-entry.tsx components/home/home-cms-content.tsx app/[locale]/heritage/[slug]/page.tsx tests/contact-application-ui.test.ts
git commit -m "feat: add contact and support applications"
```

## Task 7: Add Admin Moderation and Application Queues

**Files:**
- Create: `app/api/admin/comments/route.ts`
- Create: `app/api/admin/comments/[id]/route.ts`
- Create: `app/api/admin/contact-submissions/route.ts`
- Create: `app/api/admin/contact-submissions/[id]/route.ts`
- Create: `components/admin/engagement-admin-client.tsx`
- Modify: `app/[locale]/admin/page.tsx`
- Test: `tests/admin-engagement.test.ts`

- [ ] **Step 1: Write failing admin security tests**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin engagement queues", () => {
  it.each([
    "app/api/admin/comments/route.ts",
    "app/api/admin/comments/[id]/route.ts",
    "app/api/admin/contact-submissions/route.ts",
    "app/api/admin/contact-submissions/[id]/route.ts"
  ])("protects %s with the existing admin session", (path) => {
    expect(readFileSync(path, "utf8")).toMatch(/admin.*session|requireAdmin/i);
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- tests/admin-engagement.test.ts`

Expected: FAIL because the routes do not exist.

- [ ] **Step 3: Implement admin list/update APIs**

Reuse the exact session guard used by current admin content routes. Comment updates only accept `approved` or `rejected` and set `moderated_at`. Submission updates only accept `new`, `in_progress`, or `resolved`. List endpoints support status and kind filters with newest-first pagination.

- [ ] **Step 4: Build independent admin queues**

Add tabs for 评论审核 and 联系申请. Provide status filters, project/title context, timestamps, approve/reject actions, and new/in-progress/resolved transitions. Never expose this component outside the existing admin page.

- [ ] **Step 5: Run admin tests and typecheck**

Run: `npm test -- tests/admin-engagement.test.ts tests/admin-validation.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/comments app/api/admin/contact-submissions components/admin/engagement-admin-client.tsx app/[locale]/admin/page.tsx tests/admin-engagement.test.ts
git commit -m "feat: add comment and contact moderation"
```

## Task 8: Extend Profile Status Views

**Files:**
- Modify: `components/user/profile-dashboard.tsx`
- Test: `tests/user-engagement-profile.test.ts`

- [ ] **Step 1: Write a failing profile contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile engagement status", () => {
  it("shows comments and applications without removing favorites/history", () => {
    const source = readFileSync("components/user/profile-dashboard.tsx", "utf8");
    expect(source).toContain("heritage_comments");
    expect(source).toContain("contact_submissions");
    expect(source).toContain("user_favorites");
    expect(source).toContain("user_browsing_history");
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- tests/user-engagement-profile.test.ts`

Expected: FAIL on the two new data sources.

- [ ] **Step 3: Load and render current-user statuses**

Fetch only the signed-in user's comment and contact rows. Add “我的评论” with pending/approved/rejected labels and “支持与合作” with new/in-progress/resolved labels. Keep the existing favorites, history, recommendations, preferences, and offline cache behavior intact.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/user-engagement-profile.test.ts tests/user-integration.test.ts tests/recommendations.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/user/profile-dashboard.tsx tests/user-engagement-profile.test.ts
git commit -m "feat: show engagement status in profile"
```

## Task 9: Full Verification, Migration, and Deployment

**Files:**
- Modify only if verification finds a defect in files owned by Tasks 1-8.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run static validation**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 4: Apply the Supabase migration before exposing UI**

Apply `supabase/migrations/20260724_user_engagement_contact.sql` to the production Supabase project. Verify all three tables exist, RLS is enabled, and policies match the migration. Do not edit existing heritage, favorites, history, CMS, media, or Feishu tables.

- [ ] **Step 5: Verify desktop and mobile workflows**

Check `/zh` and `/en`, a heritage detail page, `/zh/profile`, `/en/profile`, and `/zh/admin`. Verify guest contact submission, login redirect, favorite, history, like/unlike, pending comment, admin approval, approved display, and application status changes. Confirm existing images and videos are unchanged.

- [ ] **Step 6: Commit any verification-only fixes**

```bash
git status --short
git add app components lib supabase tests
git commit -m "fix: complete engagement acceptance checks"
```

Before running `git add`, confirm `git status --short` lists only files owned by Tasks 1-8; if no verification fix was required, skip this commit.

- [ ] **Step 7: Push `main`, wait for Vercel, and verify production**

Push commits to GitHub. Wait for Vercel status `Ready`, then verify `https://www.huayunheritage.com/zh`, `/en`, login callbacks, admin queues, videos, and `/api/health`.
