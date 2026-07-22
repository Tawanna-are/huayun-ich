import { describe, expect, test } from "vitest";

import { getSpiralArcLayout } from "@/components/home/spiral-carousel-layout";

describe("getSpiralArcLayout", () => {
  test("places images on a helical stair instead of a flat row", () => {
    const layout = getSpiralArcLayout({
      count: 7,
      radius: 5.8,
      arc: Math.PI * 1.08,
      stairHeight: 2.8
    });

    expect(layout).toHaveLength(7);

    const yRange = Math.max(...layout.map((item) => item.y)) - Math.min(...layout.map((item) => item.y));
    const zRange = Math.max(...layout.map((item) => item.z)) - Math.min(...layout.map((item) => item.z));
    const scaleRange =
      Math.max(...layout.map((item) => item.scale)) - Math.min(...layout.map((item) => item.scale));

    expect(yRange).toBeGreaterThan(2.5);
    expect(zRange).toBeGreaterThan(1.1);
    expect(scaleRange).toBeGreaterThan(0.22);
    expect(layout[0].y).toBeGreaterThan(layout[layout.length - 1].y);
  });

  test("faces every image toward the camera along the spiral", () => {
    const layout = getSpiralArcLayout({
      count: 5,
      radius: 5,
      arc: Math.PI,
      stairHeight: 2
    });

    layout.forEach((item) => {
      expect(item.rotationY).toBeCloseTo(-item.angle, 6);
    });
  });
});
