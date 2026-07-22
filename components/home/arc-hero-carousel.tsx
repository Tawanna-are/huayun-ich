"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getSpiralArcLayout } from "@/components/home/spiral-carousel-layout";
import { Link, useRouter } from "@/i18n/navigation";

export type ArcHeroItem = {
  src: string;
  href: string;
  label: string;
};

type ArcHeroCarouselProps = {
  items: ArcHeroItem[];
  className?: string;
  radius?: number;
  arc?: number;
  stairHeight?: number;
  autoSpeed?: number;
  scrollStrength?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function ArcHeroCarousel({
  items,
  className = "",
  radius = 5.6,
  arc = Math.PI * 1.12,
  stairHeight = 2.6,
  autoSpeed = 0.08,
  scrollStrength = Math.PI * 1.15
}: ArcHeroCarouselProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || items.length === 0) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.15, 9.4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.touchAction = "pan-y";
    host.appendChild(renderer.domElement);

    const ring = new THREE.Group();
    ring.rotation.x = -0.08;
    scene.add(ring);

    const loader = new THREE.TextureLoader();
    const meshes: Array<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>> = [];
    const textures: THREE.Texture[] = [];
    let disposed = false;

    const layoutMeshes = () => {
      const count = Math.max(items.length, 1);
      const layout = getSpiralArcLayout({
        count,
        radius,
        arc,
        stairHeight
      });

      meshes.forEach((mesh, index) => {
        const item = layout[index];

        if (!item) {
          return;
        }

        mesh.position.set(item.x, item.y, item.z);
        mesh.rotation.set(0, item.rotationY, 0);
        mesh.scale.setScalar(item.scale);
        mesh.material.opacity = item.opacity;
        mesh.renderOrder = Math.round(item.z * 100);
        mesh.userData.baseY = item.y;
        mesh.userData.baseZ = item.z;
        mesh.userData.baseScale = item.scale;
        mesh.userData.baseOpacity = item.opacity;
        mesh.userData.baseRenderOrder = mesh.renderOrder;
      });
    };

    items.forEach((item, index) => {
      loader.load(item.src, (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        textures.push(texture);

        const aspect =
          texture.image?.width && texture.image?.height
            ? texture.image.width / texture.image.height
            : 1.6;
        const height = 3.05;
        const width = Math.min(height * aspect, 3.4);
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.floatOffset = index * 0.75;
        mesh.userData.href = item.href;
        mesh.userData.label = item.label;
        meshes[index] = mesh;
        ring.add(mesh);
        layoutMeshes();
      });
    });

    const scrollState = {
      current: 0,
      target: 0
    };

    const updateScrollTarget = () => {
      const rect = host.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);

      scrollState.target = (progress - 0.5) * scrollStrength;
    };

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      const isMobile = width < 768;

      camera.aspect = width / height;
      camera.position.z = isMobile ? 12.8 : 10.6;
      camera.updateProjectionMatrix();

      ring.position.set(isMobile ? 1.45 : 4.65, isMobile ? 2.35 : -0.1, 0);
      ring.scale.setScalar(isMobile ? 0.32 : 0.7);
      renderer.setSize(width, height, false);
      layoutMeshes();
      updateScrollTarget();
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hoverScale = 1.28;
    const hoverLift = 0.8;
    let hoveredMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined;
    let pointerInside = false;
    let pointerDownPosition: { x: number; y: number } | null = null;

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickMesh = () => {
      raycaster.setFromCamera(pointer, camera);

      return raycaster.intersectObjects(meshes.filter(Boolean), false)[0]?.object as
        | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
        | undefined;
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event);
      pointerDownPosition = { x: event.clientX, y: event.clientY };
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerInside = true;
      updatePointer(event);
      hoveredMesh = pickMesh();
      renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "default";
    };

    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerDownPosition;
      pointerDownPosition = null;

      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
        return;
      }

      updatePointer(event);
      const mesh = pickMesh();
      const href = mesh?.userData.href as string | undefined;

      if (href) {
        router.push(href);
      }
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      hoveredMesh = undefined;
      pointerDownPosition = null;
      renderer.domElement.style.cursor = "default";
    };

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      scrollState.current = THREE.MathUtils.lerp(scrollState.current, scrollState.target, 0.075);
      ring.rotation.y = scrollState.current + (reduceMotion ? 0 : elapsed * autoSpeed);
      scene.updateMatrixWorld();

      if (pointerInside) {
        hoveredMesh = pickMesh();
        renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "default";
      }

      meshes.forEach((mesh) => {
        const isHovered = mesh === hoveredMesh;
        const targetScale = mesh.userData.baseScale * (isHovered ? hoverScale : 1);
        const targetOpacity = isHovered
          ? 1
          : hoveredMesh
            ? Math.max(mesh.userData.baseOpacity * 0.42, 0.18)
            : mesh.userData.baseOpacity;

        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.14));
        mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.14);
        mesh.position.y =
          mesh.userData.baseY + Math.sin(elapsed * 0.9 + mesh.userData.floatOffset) * 0.045;
        mesh.position.z = THREE.MathUtils.lerp(
          mesh.position.z,
          mesh.userData.baseZ + (isHovered ? hoverLift : 0),
          0.14
        );
        mesh.renderOrder = isHovered ? 10_000 : mesh.userData.baseRenderOrder;
        mesh.lookAt(camera.position);
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScrollTarget);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);

      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        ring.remove(mesh);
      });
      textures.forEach((texture) => texture.dispose());

      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [arc, autoSpeed, items, radius, router, scrollStrength, stairHeight]);

  return (
    <div className={className}>
      <div ref={hostRef} className="absolute inset-0" />
      <nav className="sr-only" aria-label="Heritage image links">
        {items.map((item) => (
          <Link key={`${item.src}-${item.label}`} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
