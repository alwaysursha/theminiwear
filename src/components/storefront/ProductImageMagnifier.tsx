"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ZOOM_LEVEL = 2.75;
const LENS_SIZE = 148;

type ProductImageMagnifierProps = {
  imageUrl: string;
  alt: string;
  enabled?: boolean;
  className?: string;
  children: ReactNode;
};

export function ProductImageMagnifier({
  imageUrl,
  alt,
  enabled = true,
  className,
  children,
}: ProductImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ width: 0, height: 0 });

  const updateDims = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDims({ width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, [updateDims, imageUrl]);

  function handleMove(event: React.MouseEvent) {
    if (!enabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  const lensHalf = LENS_SIZE / 2;
  const lensLeft = Math.min(
    Math.max(pos.x - lensHalf, 0),
    Math.max(0, dims.width - LENS_SIZE),
  );
  const lensTop = Math.min(
    Math.max(pos.y - lensHalf, 0),
    Math.max(0, dims.height - LENS_SIZE),
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full",
        enabled && "md:cursor-crosshair",
        className,
      )}
      onMouseEnter={() => enabled && setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMove}
    >
      {children}
      {enabled && active && dims.width > 0 && (
        <div
          className="pointer-events-none absolute z-40 hidden overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_8px_32px_rgba(30,42,74,0.28)] ring-1 ring-navy/10 md:block"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lensLeft,
            top: lensTop,
          }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none object-cover"
            style={{
              width: dims.width,
              height: dims.height,
              left: -lensLeft,
              top: -lensTop,
              transform: `scale(${ZOOM_LEVEL})`,
              transformOrigin: `${pos.x}px ${pos.y}px`,
            }}
          />
        </div>
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
