"use client";

import Image from "next/image";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import {
  IMAGE_SCALE_STEP,
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SCALE,
  clampPan,
  clampScale,
  type ImagePan
} from "@/components/heritage/image-zoom-state";

type ZoomableImageViewerProps = {
  src: string;
  alt: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetZoomLabel: string;
};

type PointerPosition = {
  x: number;
  y: number;
};

function getPointerDistance(points: PointerPosition[]) {
  if (points.length < 2) return 0;
  return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
}

export function ZoomableImageViewer({ src, alt, zoomInLabel, zoomOutLabel, resetZoomLabel }: ZoomableImageViewerProps) {
  const [scale, setScale] = useState(MIN_IMAGE_SCALE);
  const [pan, setPan] = useState<ImagePan>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const activePointersRef = useRef(new Map<number, PointerPosition>());
  const dragStartRef = useRef<{ pointer: PointerPosition; pan: ImagePan } | null>(null);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);

  const getViewport = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
  }, []);

  const applyScale = useCallback((value: number) => {
    const nextScale = clampScale(value);
    setScale(nextScale);
    setPan((currentPan) => clampPan(currentPan, nextScale, getViewport()));
  }, [getViewport]);

  const resetZoom = useCallback(() => {
    setScale(MIN_IMAGE_SCALE);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [resetZoom, src]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      setPan((currentPan) => clampPan(currentPan, scale, getViewport()));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [getViewport, scale]);

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    applyScale(scale + (event.deltaY < 0 ? IMAGE_SCALE_STEP : -IMAGE_SCALE_STEP));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    activePointersRef.current.set(event.pointerId, point);

    const points = [...activePointersRef.current.values()];
    if (points.length === 2) {
      pinchStartRef.current = { distance: getPointerDistance(points), scale };
      dragStartRef.current = null;
    } else if (points.length === 1 && scale > MIN_IMAGE_SCALE) {
      dragStartRef.current = { pointer: point, pan };
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!activePointersRef.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    activePointersRef.current.set(event.pointerId, point);
    const points = [...activePointersRef.current.values()];

    if (points.length === 2 && pinchStartRef.current) {
      const distance = getPointerDistance(points);
      if (pinchStartRef.current.distance > 0) {
        applyScale(pinchStartRef.current.scale * (distance / pinchStartRef.current.distance));
      }
      return;
    }

    if (points.length === 1 && dragStartRef.current && scale > MIN_IMAGE_SCALE) {
      const nextPan = {
        x: dragStartRef.current.pan.x + point.x - dragStartRef.current.pointer.x,
        y: dragStartRef.current.pan.y + point.y - dragStartRef.current.pointer.y
      };
      setPan(clampPan(nextPan, scale, getViewport()));
    }
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    activePointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const points = [...activePointersRef.current.values()];
    pinchStartRef.current = null;
    dragStartRef.current = points.length === 1 && scale > MIN_IMAGE_SCALE
      ? { pointer: points[0], pan }
      : null;
  }

  const controlClassName = "grid size-10 place-items-center rounded-full border border-white/20 bg-[#071612]/70 text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none";

  return (
    <div
      ref={viewportRef}
      className={`pointer-events-auto relative h-full w-full overflow-hidden ${scale > MIN_IMAGE_SCALE ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      style={{ touchAction: "none" }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
    >
      <div
        className="relative h-full w-full transform-gpu transition-transform duration-150 motion-reduce:transition-none"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})` }}
      >
        <Image src={src} alt={alt} fill sizes="100vw" className="pointer-events-none select-none object-contain" draggable={false} priority />
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#071612]/55 p-1.5 shadow-lg backdrop-blur-md sm:bottom-6">
        <button type="button" onClick={() => applyScale(scale - IMAGE_SCALE_STEP)} disabled={scale <= MIN_IMAGE_SCALE} className={controlClassName} aria-label={zoomOutLabel} title={zoomOutLabel}>
          <ZoomOut className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={resetZoom} disabled={scale <= MIN_IMAGE_SCALE} className={controlClassName} aria-label={resetZoomLabel} title={resetZoomLabel}>
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => applyScale(scale + IMAGE_SCALE_STEP)} disabled={scale >= MAX_IMAGE_SCALE} className={controlClassName} aria-label={zoomInLabel} title={zoomInLabel}>
          <ZoomIn className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
