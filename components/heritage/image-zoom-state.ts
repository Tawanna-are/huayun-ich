export const MIN_IMAGE_SCALE = 1;
export const MAX_IMAGE_SCALE = 4;
export const IMAGE_SCALE_STEP = 0.5;

export type ImagePan = {
  x: number;
  y: number;
};

export type ImageViewport = {
  width: number;
  height: number;
};

export function clampScale(value: number) {
  return Math.min(MAX_IMAGE_SCALE, Math.max(MIN_IMAGE_SCALE, value));
}

export function clampPan(pan: ImagePan, scale: number, viewport: ImageViewport): ImagePan {
  if (scale <= MIN_IMAGE_SCALE) return { x: 0, y: 0 };

  const maxX = Math.max(0, (viewport.width * (scale - 1)) / 2);
  const maxY = Math.max(0, (viewport.height * (scale - 1)) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, pan.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.y))
  };
}
