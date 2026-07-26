# Gallery Image Zoom Design

## Goal

Allow visitors to inspect heritage craft details inside the existing full-screen image preview without changing the gallery layout, content model, uploads, favorites, likes, CMS, or other business behavior.

## Interaction

- Keep the current full-screen dialog and its existing title, favorite, like, and close actions.
- Add icon controls for zoom in, zoom out, and reset in the dialog header.
- Support mouse-wheel zoom on desktop.
- Support two-finger pinch zoom on touch devices.
- Allow pointer or touch dragging only while the image is zoomed above 1x.
- Clamp zoom between 1x and 4x.
- Keep the image centered and fitted to the viewport at 1x.
- Clamp panning so the enlarged image cannot be dragged completely out of view.
- Reset zoom and pan whenever the preview closes or a different image opens.
- Keep Escape-to-close, backdrop close, focus restoration, and body scroll locking.

## Components

- Add a focused zoomable image viewer component that owns scale, pan, pointer, wheel, and pinch state.
- Keep `CraftMediaGallery` responsible for gallery selection and dialog accessibility.
- Render the zoom controls through the viewer's public actions so gallery business controls remain unchanged.

## Accessibility

- Use icon buttons with visible tooltips and localized accessible labels.
- Disable zoom-out and reset when already at 1x, and disable zoom-in at 4x.
- Preserve keyboard focus behavior and Escape handling from the existing dialog.
- Respect reduced-motion preferences by avoiding required animated transitions.

## Verification

- Unit-test scale clamping and reset behavior.
- Verify the dialog source includes zoom, pan, wheel, and pinch support.
- Run TypeScript checking, the complete test suite, and a production build.
- Inspect desktop and mobile production previews without changing page layout.
