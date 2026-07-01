"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

type ProductImageZoomLightboxProps = {
  images: GalleryImage[];
  selected: number;
  productName: string;
  onClose: () => void;
  onSelect: (index: number) => void;
};

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

export function ProductImageZoomLightbox({
  images,
  selected,
  productName,
  onClose,
  onSelect,
}: ProductImageZoomLightboxProps) {
  const count = images.length;
  const image = images[selected];
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetView();
  }, [selected, resetView]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && count > 1) {
        onSelect((selected - 1 + count) % count);
      }
      if (event.key === "ArrowRight" && count > 1) {
        onSelect((selected + 1) % count);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("padding-right");
      window.scrollTo(0, scrollY);
    };
  }, [count, onClose, onSelect, selected]);

  function goPrev() {
    if (count < 2) return;
    onSelect((selected - 1 + count) % count);
  }

  function goNext() {
    if (count < 2) return;
    onSelect((selected + 1) % count);
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
    setScale((current) => {
      const next = clampScale(current + delta);
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (scale <= 1) return;
    viewportRef.current?.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragging || scale <= 1) return;
    setOffset({
      x: dragStart.current.ox + (event.clientX - dragStart.current.x),
      y: dragStart.current.oy + (event.clientY - dragStart.current.y),
    });
  }

  function handlePointerUp(event: React.PointerEvent) {
    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchStart.current = { dist, scale };
      return;
    }

    if (event.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setScale((current) => {
          if (current > 1) {
            setOffset({ x: 0, y: 0 });
            return 1;
          }
          return 2;
        });
      }
      lastTap.current = now;
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length !== 2 || !pinchStart.current) return;
    event.preventDefault();
    const [a, b] = [event.touches[0], event.touches[1]];
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const ratio = dist / pinchStart.current.dist;
    setScale(clampScale(pinchStart.current.scale * ratio));
  }

  function handleTouchEnd() {
    pinchStart.current = null;
    setScale((current) => {
      if (current <= 1) setOffset({ x: 0, y: 0 });
      return current;
    });
  }

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-navy/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Zoomed view of ${productName}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{productName}</p>
          {count > 1 && (
            <p className="text-xs text-white/60">
              Image {selected + 1} of {count}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close zoom view"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "relative flex flex-1 touch-none items-center justify-center overflow-hidden",
          scale > 1 && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-5 sm:h-11 sm:w-11"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-5 sm:h-11 sm:w-11"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt ?? `${productName} — zoomed`}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        />
      </div>

      <div className="flex flex-col gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto flex items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() =>
              setScale((current) => {
                const next = clampScale(current - 0.5);
                if (next <= 1) setOffset({ x: 0, y: 0 });
                return next;
              })
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 disabled:opacity-40"
            aria-label="Zoom out"
            disabled={scale <= MIN_SCALE}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[3.5rem] text-center text-xs font-semibold text-white/80">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((current) => clampScale(current + 0.5))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 disabled:opacity-40"
            aria-label="Zoom in"
            disabled={scale >= MAX_SCALE}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <p className="text-center text-[11px] text-white/55 sm:text-xs">
          Pinch or use +/- to inspect fabric · double-tap to zoom · drag when zoomed in
        </p>

        {count > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((thumb, index) => (
              <button
                key={thumb.id}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16",
                  selected === index
                    ? "border-coral ring-2 ring-coral/30"
                    : "border-white/20 opacity-70 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1}`}
                aria-current={selected === index}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
