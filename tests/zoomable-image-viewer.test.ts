import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("components/heritage/zoomable-image-viewer.tsx", "utf8");

describe("zoomable image viewer", () => {
  it("provides accessible zoom controls backed by shared geometry", () => {
    expect(source).toContain("ZoomIn");
    expect(source).toContain("ZoomOut");
    expect(source).toContain("RotateCcw");
    expect(source).toContain("clampScale");
    expect(source).toContain("clampPan");
    expect(source).toContain("disabled={scale >= MAX_IMAGE_SCALE}");
    expect(source).toContain("disabled={scale <= MIN_IMAGE_SCALE}");
  });

  it("supports wheel, pointer drag and two-pointer pinch gestures", () => {
    expect(source).toContain("onWheel");
    expect(source).toContain("setPointerCapture");
    expect(source).toContain("activePointersRef");
    expect(source).toContain("getPointerDistance");
    expect(source).toContain("touchAction: \"none\"");
  });

  it("renders transform-based pan and scale without layout shifts", () => {
    expect(source).toContain("translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})");
    expect(source).toContain("motion-reduce:transition-none");
  });
});
