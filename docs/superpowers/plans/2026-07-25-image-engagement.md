# Image-Level Engagement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add independent favorites and authenticated likes for every heritage gallery image, with synchronized gallery/modal controls and a personal-center image collection.

**Architecture:** Carry stable media UUIDs from the content repository into `HeritageGalleryImage`. Reuse `user_favorites` for image favorites, add a dedicated `heritage_image_likes` table and API for image likes, and compose both behaviors in a focused `HeritageImageActions` client component. Keep existing project-level engagement unchanged.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Supabase/Postgres RLS, Tailwind CSS, Vitest.

---

### Task 1: Carry Stable Image IDs Through the Repository

**Files:**
- Modify: `lib/types/heritage.ts`
- Modify: `lib/content/heritage-repository.ts`
- Test: `tests/content-repository.test.ts`

- [ ] **Step 1: Write a failing repository test**

Add an assertion that mapped gallery entries preserve the source media UUID:

```ts
expect(item.gallery[0]).toMatchObject({
  id: "22222222-2222-4222-8222-222222222222",
  src: "/gallery.jpg"
});
```

- [ ] **Step 2: Run the repository test and confirm failure**

Run: `npm test -- tests/content-repository.test.ts`

Expected: FAIL because `HeritageGalleryImage` has no `id`.

- [ ] **Step 3: Add the stable ID to the public type and mapper**

```ts
export type HeritageGalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};
```

Map it from the existing media record:

```ts
gallery: galleryImages.map((image) => ({
  id: image.id,
  src: image.url,
  alt: image.alt ?? row.name,
  caption: image.caption ?? row.name
}))
```

- [ ] **Step 4: Run the repository test**

Run: `npm test -- tests/content-repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/types/heritage.ts lib/content/heritage-repository.ts tests/content-repository.test.ts
git commit -m "feat: expose stable gallery image ids"
```

### Task 2: Add the Image Engagement Schema

**Files:**
- Create: `supabase/migrations/20260725_image_engagement.sql`
- Modify: `supabase/schema.sql`
- Modify: `lib/types/database.ts`
- Test: `tests/image-engagement-schema.test.ts`

- [ ] **Step 1: Write failing schema tests**

Assert that the migration contains:

```ts
expect(sql).toContain("'heritage_image'");
expect(sql).toContain("create table if not exists public.heritage_image_likes");
expect(sql).toContain("unique (user_id, image_id)");
expect(sql).toContain("alter table public.heritage_image_likes enable row level security");
```

- [ ] **Step 2: Run the schema test and confirm failure**

Run: `npm test -- tests/image-engagement-schema.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Add the idempotent migration**

The migration must replace the existing favorite target check and create image likes:

```sql
alter table public.user_favorites
  drop constraint if exists user_favorites_target_type_check;

alter table public.user_favorites
  add constraint user_favorites_target_type_check
  check (target_type in ('heritage', 'inheritor', 'museum_topic', 'heritage_image'));

create table if not exists public.heritage_image_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heritage_item_id uuid not null references public.heritage_items(id) on delete cascade,
  image_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, image_id)
);

create index if not exists heritage_image_likes_image_idx
  on public.heritage_image_likes(image_id, created_at desc);
create index if not exists heritage_image_likes_item_idx
  on public.heritage_image_likes(heritage_item_id, created_at desc);

alter table public.heritage_image_likes enable row level security;

drop policy if exists "Public read image likes" on public.heritage_image_likes;
create policy "Public read image likes"
  on public.heritage_image_likes for select using (true);

drop policy if exists "Users manage own image likes" on public.heritage_image_likes;
create policy "Users manage own image likes"
  on public.heritage_image_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Mirror the statements in `supabase/schema.sql` and extend the TypeScript union:

```ts
export type UserFavoriteTargetType = "heritage" | "inheritor" | "museum_topic" | "heritage_image";
```

Add `HeritageImageLikeRow` matching the columns above.

- [ ] **Step 4: Run schema tests**

Run: `npm test -- tests/image-engagement-schema.test.ts tests/user-system-schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260725_image_engagement.sql supabase/schema.sql lib/types/database.ts tests/image-engagement-schema.test.ts
git commit -m "feat: add image engagement schema"
```

### Task 3: Add the Authenticated Image Likes API

**Files:**
- Create: `app/api/engagement/image-likes/route.ts`
- Test: `tests/heritage-image-likes.test.ts`

- [ ] **Step 1: Write failing route contract tests**

Assert the route validates `heritageItemId` and `imageId`, reads `heritage_image_likes`, verifies the image belongs to the item, and returns `authentication_required` for unauthenticated POST requests.

```ts
expect(source).toContain('from("heritage_image_likes")');
expect(source).toContain("authentication_required");
expect(source).toContain("image_belongs_to_item");
expect(source).toContain("authenticated: Boolean(userId)");
```

- [ ] **Step 2: Run the route test and confirm failure**

Run: `npm test -- tests/heritage-image-likes.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement GET and POST**

Use the existing `createSupabaseAdminClient` and bearer-token pattern from `app/api/engagement/likes/route.ts`. Add a helper that confirms the UUID pair exists in either current media source:

```ts
async function imageBelongsToItem(admin, heritageItemId: string, imageId: string) {
  const [asset, legacy] = await Promise.all([
    admin.from("media_assets").select("id").eq("id", imageId).eq("heritage_id", heritageItemId).eq("file_type", "image").maybeSingle(),
    admin.from("heritage_media").select("id").eq("id", imageId).eq("heritage_item_id", heritageItemId).eq("media_type", "image").maybeSingle()
  ]);
  if (asset.error) throw asset.error;
  if (legacy.error) throw legacy.error;
  return Boolean(asset.data || legacy.data);
}
```

GET returns `{ count, liked, authenticated }`. POST upserts or deletes `(user_id, image_id)` and returns `{ liked, count }`.

- [ ] **Step 4: Run route tests**

Run: `npm test -- tests/heritage-image-likes.test.ts tests/heritage-likes.test.ts`

Expected: PASS, including unchanged project likes.

- [ ] **Step 5: Commit**

```bash
git add app/api/engagement/image-likes/route.ts tests/heritage-image-likes.test.ts
git commit -m "feat: add image likes api"
```

### Task 4: Build Synchronized Per-Image Actions

**Files:**
- Create: `components/heritage/heritage-image-actions.tsx`
- Modify: `components/user/favorite-button.tsx`
- Test: `tests/heritage-image-actions.test.ts`

- [ ] **Step 1: Write failing component contract tests**

Assert the component uses image identifiers, the image-likes API, image favorite target type, and a synchronization event:

```ts
expect(source).toContain('targetType="heritage_image"');
expect(source).toContain("/api/engagement/image-likes");
expect(source).toContain("huayun:image-engagement");
expect(source).toContain("heritageItemId");
expect(source).toContain("imageId");
```

- [ ] **Step 2: Run the component test and confirm failure**

Run: `npm test -- tests/heritage-image-actions.test.ts`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Extend favorite callbacks and build the component**

Add optional `onChange?: (favorite: boolean) => void` to `FavoriteButton`. Invoke it after a successful insert or delete. When `targetType === "heritage_image"`, retain `itemId` as the owning `heritage_item_id` while using `targetId` as the image UUID:

```ts
heritage_item_id:
  targetType === "heritage" || targetType === "heritage_image"
    ? itemId ?? null
    : null
```

Create `HeritageImageActions` with this public interface:

```ts
type HeritageImageActionsProps = {
  heritageItemId: string;
  imageId: string;
  light?: boolean;
};
```

It renders:

```tsx
<FavoriteButton
  itemId={heritageItemId}
  targetType="heritage_image"
  targetId={imageId}
  className={buttonClassName}
  onChange={(favorite) => publish({ favorite })}
/>
```

and an authenticated image-like button backed by `/api/engagement/image-likes`. Dispatch and listen for `huayun:image-engagement` events containing the same `imageId`, so caption and modal instances update together.

- [ ] **Step 4: Run component and existing favorite tests**

Run: `npm test -- tests/heritage-image-actions.test.ts tests/pwa-favorites.test.ts tests/heritage-likes.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/heritage/heritage-image-actions.tsx components/user/favorite-button.tsx tests/heritage-image-actions.test.ts
git commit -m "feat: add synchronized image actions"
```

### Task 5: Place Actions Beside Every Image Name and in the Modal

**Files:**
- Modify: `components/heritage/craft-media-gallery.tsx`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Test: `tests/heritage-media-experience.test.ts`

- [ ] **Step 1: Add failing gallery placement assertions**

```ts
expect(gallery).toContain("HeritageImageActions");
expect(gallery).toContain("image.id");
expect(gallery).toContain("selectedImage.id");
expect(gallery).toContain("heritageItemId");
```

- [ ] **Step 2: Run the gallery test and confirm failure**

Run: `npm test -- tests/heritage-media-experience.test.ts`

Expected: FAIL because per-image actions are absent.

- [ ] **Step 3: Add the project ID prop and caption rows**

Change the gallery interface to accept `heritageItemId: string`. Replace caption-only rendering with a stable row:

```tsx
<figcaption className="flex flex-wrap items-center justify-between gap-3 py-4">
  <span className="text-xs text-[#65716b]">{image.caption || itemName}</span>
  <HeritageImageActions heritageItemId={heritageItemId} imageId={image.id} />
</figcaption>
```

Render the light variant in the modal:

```tsx
<HeritageImageActions
  heritageItemId={heritageItemId}
  imageId={selectedImage.id}
  light
/>
```

Pass `heritageItemId={item.id}` from the detail page. Keep project-level hero actions unchanged.

- [ ] **Step 4: Run gallery and interaction tests**

Run: `npm test -- tests/heritage-media-experience.test.ts tests/user-engagement-entry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/heritage/craft-media-gallery.tsx app/[locale]/heritage/[slug]/page.tsx tests/heritage-media-experience.test.ts
git commit -m "feat: add actions to every gallery image"
```

### Task 6: Add Image Favorites to the Personal Center

**Files:**
- Modify: `components/user/profile-dashboard.tsx`
- Test: `tests/user-engagement-profile.test.ts`

- [ ] **Step 1: Write failing profile assertions**

```ts
expect(source).toContain("heritage_image");
expect(source).toContain("imageFavorites");
expect(source).toContain("imageFavoritesLabel");
expect(source).toContain("image.id");
```

- [ ] **Step 2: Run the profile test and confirm failure**

Run: `npm test -- tests/user-engagement-profile.test.ts`

Expected: FAIL because image favorites are not mapped.

- [ ] **Step 3: Map and render image favorites**

Build a lookup from current content:

```ts
const imageById = new Map(
  items.flatMap((item) => item.gallery.map((image) => [image.id, { image, item }] as const))
);
```

Filter `target_type === "heritage_image"`, map through `imageById`, include the result in `favoriteCount`, and add localized `imageFavoritesLabel` strings (`图片收藏` / `Saved Images`). Render cards with the thumbnail, caption, project name, and localized link to `/heritage/${item.slug}`.

Do not pass image favorites to `FavoriteOfflineCache`.

- [ ] **Step 4: Run profile and user tests**

Run: `npm test -- tests/user-engagement-profile.test.ts tests/user-pages.test.ts tests/user-preferences.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/user/profile-dashboard.tsx tests/user-engagement-profile.test.ts
git commit -m "feat: show saved images in profile"
```

### Task 7: Full Verification and Production Migration Handoff

**Files:**
- Verify: `supabase/migrations/20260725_image_engagement.sql`
- Verify: all modified source and tests

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all test files and tests PASS.

- [ ] **Step 2: Run type checking**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: compilation succeeds and all static pages generate.

- [ ] **Step 4: Perform local visual QA**

Verify desktop `1440x1000` and mobile `390x844`:

- every gallery caption has image-specific actions;
- long names wrap without overlap;
- full-screen modal shows light controls without covering Close;
- image A interaction does not change image B;
- caption and modal for image A stay synchronized;
- logged-out actions route to login;
- personal center shows saved image thumbnails.

- [ ] **Step 5: Commit verification adjustments**

```bash
git add -A
git commit -m "test: verify image engagement workflows"
```

- [ ] **Step 6: Apply the production migration before deployment**

Open Supabase SQL Editor for the production project, run the complete contents of `supabase/migrations/20260725_image_engagement.sql`, and verify `Success. No rows returned`.

- [ ] **Step 7: Push and verify production**

```bash
git push origin main
```

Wait for Vercel `Ready`, then verify on `https://www.huayunheritage.com/zh` and `/en` that image favorites, image likes, profile display, and project-level actions all work independently.
