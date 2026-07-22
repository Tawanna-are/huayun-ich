# Admin Media Caption Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated inline editing of each project image's visible name and accessibility description in the existing CMS media manager.

**Architecture:** Extend the current project-media PATCH action instead of adding an endpoint. Validate and normalize metadata in the existing pure admin helper, persist to `heritage_media`, mirror to `media_assets` by storage identity, and refresh the existing CMS content response after save.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase, Vitest, Tailwind CSS, lucide-react.

---

## File Map

- Modify: `tests/admin-project-media.test.ts` - validator and UI/API wiring contracts.
- Modify: `lib/admin/project-media.ts` - `update-metadata` payload validation.
- Modify: `lib/admin/media-assets.ts` - caption/alt mirror helper.
- Modify: `app/api/admin/media/[id]/route.ts` - authenticated metadata persistence.
- Modify: `components/admin/project-media-manager.tsx` - inline image metadata editor.
- No migration, schema, public Gallery, Feishu, or heritage item changes.

### Task 1: Validate Image Metadata Payloads

**Files:**
- Modify: `tests/admin-project-media.test.ts`
- Modify: `lib/admin/project-media.ts`
- Test: `tests/admin-project-media.test.ts`

- [ ] **Step 1: Write failing validator tests**

Add assertions:

```ts
expect(validateProjectMediaActionPayload({
  action: "update-metadata",
  caption: "  Peony Embroidered Handbag  ",
  alt: "  Pink peony embroidery on a silk handbag.  "
})).toEqual({
  ok: true,
  action: "update-metadata",
  caption: "Peony Embroidered Handbag",
  alt: "Pink peony embroidery on a silk handbag."
});

expect(validateProjectMediaActionPayload({ action: "update-metadata", caption: "   ", alt: "" })).toEqual({
  ok: false,
  error: "Image name is required."
});
expect(validateProjectMediaActionPayload({ action: "update-metadata", caption: "x".repeat(161), alt: "" })).toEqual({
  ok: false,
  error: "Image name must be 160 characters or fewer."
});
expect(validateProjectMediaActionPayload({ action: "update-metadata", caption: "Valid name", alt: "x".repeat(301) })).toEqual({
  ok: false,
  error: "Image description must be 300 characters or fewer."
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-project-media.test.ts`

Expected: FAIL because `update-metadata` is rejected as an invalid action.

- [ ] **Step 3: Implement minimal validation**

Extend `ProjectMediaAction` and `ProjectMediaActionValidationResult` with:

```ts
{
  ok: true;
  action: "update-metadata";
  caption: string;
  alt: string;
}
```

In `validateProjectMediaActionPayload`, trim string fields, require caption, enforce 160/300 limits, and return the normalized values. Do not change existing action behavior.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/admin-project-media.test.ts`

Expected: all admin project-media tests PASS.

### Task 2: Lock API and CMS Wiring Contracts

**Files:**
- Modify: `tests/admin-project-media.test.ts`
- Test: `tests/admin-project-media.test.ts`

- [ ] **Step 1: Add failing source-contract tests**

Add one test that reads the relevant source files and asserts:

```ts
const manager = readFileSync("components/admin/project-media-manager.tsx", "utf8");
const route = readFileSync("app/api/admin/media/[id]/route.ts", "utf8");
const mirror = readFileSync("lib/admin/media-assets.ts", "utf8");

expect(manager).toContain("Image name");
expect(manager).toContain("Image description");
expect(manager).toContain('action: "update-metadata"');
expect(manager).toContain("saveMediaMetadata");
expect(route).toContain('validation.action === "update-metadata"');
expect(route).toContain("updateMediaAssetMetadataByStorageIdentity");
expect(mirror).toContain("export async function updateMediaAssetMetadataByStorageIdentity");
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-project-media.test.ts`

Expected: FAIL because the route, mirror helper, and editor are not implemented.

### Task 3: Persist Caption and Alt to Both Media Tables

**Files:**
- Modify: `lib/admin/media-assets.ts`
- Modify: `app/api/admin/media/[id]/route.ts`
- Test: `tests/admin-project-media.test.ts`

- [ ] **Step 1: Add the media-assets mirror helper**

Implement:

```ts
export async function updateMediaAssetMetadataByStorageIdentity(
  supabase: AdminSupabaseClient,
  identity: { url: string; storagePath: string | null },
  patch: { caption: string; alt: string | null }
) {
  const values = {
    title: patch.caption,
    caption: patch.caption,
    alt: patch.alt
  };

  if (identity.storagePath) {
    const { error } = await supabase.from("media_assets").update(values).eq("storage_path", identity.storagePath);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase.from("media_assets").update(values).eq("file_url", identity.url);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 2: Add the authenticated route branch**

Import the new helper. After loading `rows`, handle `update-metadata` before ordering actions:

```ts
if (validation.action === "update-metadata") {
  const selected = rows.find((row) => row.id === id);

  if (!selected || selected.media_type !== "image") {
    return NextResponse.json({ error: "Only image metadata can be edited here." }, { status: 422 });
  }

  const values = { caption: validation.caption, alt: validation.alt || null };
  const { error } = await supabase.from("heritage_media").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  await updateMediaAssetMetadataByStorageIdentity(
    supabase,
    { url: selected.url, storagePath: selected.storage_path },
    values
  );

  return NextResponse.json({ ok: true, updated: 1 });
}
```

- [ ] **Step 3: Run the focused tests**

Run: `npm test -- tests/admin-project-media.test.ts`

Expected: validator tests pass; source-contract test still fails only on missing UI editor.

### Task 4: Add Inline Editing to Image Cards

**Files:**
- Modify: `components/admin/project-media-manager.tsx`
- Test: `tests/admin-project-media.test.ts`

- [ ] **Step 1: Add editor state and controls**

Import `Pencil`, `Save`, `X`, and `Textarea`. Extend `MediaCard` with:

```ts
onMetadataSave: (mediaId: string, values: { caption: string; alt: string }) => Promise<boolean>;
```

Initialize `caption` and `alt` state from `media`, reset it in an effect when the media values change, and render Edit for images. In edit mode render labeled Image name and Image description fields plus Save and Cancel. Disable Save when busy or caption is blank.

- [ ] **Step 2: Add the parent save request**

Implement:

```ts
async function saveMediaMetadata(mediaId: string, values: { caption: string; alt: string }) {
  if (!isAuthenticated) {
    setStatus("Sign in before editing media.");
    return false;
  }

  setBusyMediaId(mediaId);
  const response = await fetch(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ action: "update-metadata", ...values })
  });
  const payload = (await response.json()) as { error?: string };
  setBusyMediaId(null);

  if (!response.ok) {
    setStatus(payload.error ?? "Failed to update image details.");
    return false;
  }

  setStatus("Image details updated.");
  await onChanged();
  return true;
}
```

Pass it to image and video `MediaCard` instances; the card itself hides editing for videos.

- [ ] **Step 3: Verify GREEN**

Run: `npm test -- tests/admin-project-media.test.ts`

Expected: all focused tests PASS.

### Task 5: Verify Persistence and Production Build

**Files:** no additional production files.

- [ ] **Step 1: Run full static verification**

Run:

```text
npm test
npm run typecheck
npm run build
```

Expected: every command exits `0`.

- [ ] **Step 2: Verify authenticated persistence without leaving test data**

Using `ADMIN_API_KEY`, select an existing Gallery image and capture its original caption/alt. PATCH a unique temporary caption and description through `/api/admin/media/[id]`, refresh `/api/admin/content`, and confirm both values. Then PATCH the original values back and verify restoration through both `heritage_media` and `media_assets` readback.

- [ ] **Step 3: Verify the CMS UI**

Open `/zh/admin`, authenticate, select a project with Gallery images, and confirm image cards show Edit, Image name, Image description, Save, and Cancel. Verify the layout at 1440px and 390px with no horizontal overflow. Do not leave any content modified after acceptance.

## Constraints

- No Supabase migration, table, or column change.
- No public Gallery component change.
- No heritage item field or Feishu synchronization change.
- The project has no `.git` directory, so commit steps are omitted.
