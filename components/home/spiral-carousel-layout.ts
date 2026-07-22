export type SpiralArcLayoutOptions = {
  count: number;
  radius: number;
  arc: number;
  stairHeight?: number;
  depthOffset?: number;
};

export type SpiralArcLayoutItem = {
  angle: number;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scale: number;
  opacity: number;
};

const normalize = (value: number, min: number, max: number) => {
  if (max === min) {
    return 1;
  }

  return (value - min) / (max - min);
};

export function getSpiralArcLayout({
  count,
  radius,
  arc,
  stairHeight = 2.6,
  depthOffset = 0.56
}: SpiralArcLayoutOptions): SpiralArcLayoutItem[] {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) {
    return [];
  }

  const denominator = Math.max(safeCount - 1, 1);
  const rawItems = Array.from({ length: safeCount }, (_, index) => {
    const progress = safeCount === 1 ? 0.5 : index / denominator;
    const angle = safeCount === 1 ? 0 : -arc / 2 + arc * progress;
    const z = Math.cos(angle) * radius - radius * depthOffset;

    return {
      angle,
      progress,
      x: Math.sin(angle) * radius,
      y: (0.5 - progress) * stairHeight,
      z
    };
  });

  const zValues = rawItems.map((item) => item.z);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);

  return rawItems.map((item) => {
    const frontness = normalize(item.z, minZ, maxZ);

    return {
      angle: item.angle,
      x: item.x,
      y: item.y,
      z: item.z,
      rotationY: -item.angle,
      scale: 0.72 + frontness * 0.34,
      opacity: 0.68 + frontness * 0.32
    };
  });
}
