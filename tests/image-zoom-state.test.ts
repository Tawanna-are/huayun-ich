import { describe, expect, it } from "vitest";
import {
  IMAGE_SCALE_STEP,
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SCALE,
  clampPan,
  clampScale
} from "@/components/heritage/image-zoom-state";

describe("image zoom geometry", () => {
  it("clamps scale to the supported range", () => {
    expect(MIN_IMAGE_SCALE).toBe(1);
    expect(MAX_IMAGE_SCALE).toBe(4);
    expect(IMAGE_SCALE_STEP).toBe(0.5);
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(2.25)).toBe(2.25);
    expect(clampScale(8)).toBe(4);
  });

  it("centers pan at 1x and clamps movement while enlarged", () => {
    const viewport = { width: 800, height: 600 };

    expect(clampPan({ x: 120, y: -80 }, 1, viewport)).toEqual({ x: 0, y: 0 });
    expect(clampPan({ x: 700, y: -500 }, 2, viewport)).toEqual({ x: 400, y: -300 });
    expect(clampPan({ x: 120, y: -80 }, 2, viewport)).toEqual({ x: 120, y: -80 });
  });
});
