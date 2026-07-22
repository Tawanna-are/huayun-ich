# Admin Media Caption Editing Design

**Date:** 2026-07-20

## Objective

Allow administrators to edit each project image's visible name and accessibility description directly from the existing CMS media manager.

## UI

Each image card in `ProjectMediaManager` gains an Edit action. Editing expands two inline fields:

- **Image name**: required, saved to `caption`, displayed below the public Gallery image.
- **Image description**: optional, saved to `alt`, used by image accessibility and SEO metadata.

The editor is initialized from the current media values and provides Save and Cancel commands. While saving, the card's other media actions remain disabled. Video cards retain their current controls and do not show this editor.

The project has one `caption` and one `alt` field, so the entered values are shared by Chinese and English routes. No bilingual media field is introduced.

## Validation

- `caption` is trimmed and must contain 1 to 160 characters.
- `alt` is trimmed, optional, and limited to 300 characters.
- Invalid requests return status 422 with a concise error.
- Existing set-cover, main-video, move, and delete actions remain unchanged.

## Data Flow

The existing authenticated `PATCH /api/admin/media/[id]` route gains an `update-metadata` action. It updates the selected `heritage_media` row's `caption` and `alt`, then mirrors the same values to matching `media_assets` rows using storage path and file URL identity. The public repository continues reading existing fields without modification.

No new endpoint, table, column, CMS data structure, or storage operation is introduced.

## Component Boundaries

- `lib/admin/project-media.ts`: validate and normalize the new action payload.
- `lib/admin/media-assets.ts`: mirror caption and alt to `media_assets` by storage identity.
- `app/api/admin/media/[id]/route.ts`: authorize and persist metadata updates.
- `components/admin/project-media-manager.tsx`: render the inline image editor and refresh data after save.

## Testing

- Unit tests cover valid trimming, empty caption, overlong caption, overlong alt, and existing media actions.
- Source contract tests confirm the image editor and `update-metadata` request are wired into the CMS.
- Focused tests run RED before production changes and GREEN afterward.
- Full test suite, typecheck, and production build must pass.
- Browser acceptance verifies login, editing one image caption, persistence after refresh, and restoration of the original value so production content is not left altered by the test.

## Constraints

- Do not modify Supabase schema, CMS data shape, heritage item fields, public Gallery components, Feishu synchronization, or uploaded files.
- Keep `caption` as the visible public image name and `alt` as the non-visible description.
