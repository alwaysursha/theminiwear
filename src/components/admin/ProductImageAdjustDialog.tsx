"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Move, X } from "lucide-react";
import type { ProductImageInput } from "@/lib/actions/products";
import {
  defaultProductImageFraming,
  normalizeProductImageFraming,
  type ProductImageFitMode,
} from "@/lib/product-image-display";
import { ProductFramedPreview } from "@/components/storefront/ProductFramedPreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProductImageAdjustDialogProps = {
  open: boolean;
  image: ProductImageInput;
  previewUrl: string;
  onClose: () => void;
  onSave: (patch: Partial<ProductImageInput>) => void;
};

export function ProductImageAdjustDialog({
  open,
  image,
  previewUrl,
  onClose,
  onSave,
}: ProductImageAdjustDialogProps) {
  const framing = normalizeProductImageFraming(image);
  const [focalX, setFocalX] = useState(framing.focalX);
  const [focalY, setFocalY] = useState(framing.focalY);
  const [zoom, setZoom] = useState(framing.zoom);
  const [fitMode, setFitMode] = useState<ProductImageFitMode>(framing.fitMode);
  const dragRef = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    const next = normalizeProductImageFraming(image);
    setFocalX(next.focalX);
    setFocalY(next.focalY);
    setZoom(next.zoom);
    setFitMode(next.fitMode);
  }, [image, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (fitMode !== "cover") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, focalX, focalY };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - dragRef.current.x) / rect.width) * 100;
    const deltaY = ((event.clientY - dragRef.current.y) / rect.height) * 100;
    setFocalX(clampPercent(dragRef.current.focalX - deltaX));
    setFocalY(clampPercent(dragRef.current.focalY - deltaY));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function handleSave() {
    onSave({ focalX, focalY, zoom, fitMode });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="pr-8 text-lg font-semibold text-slate-900">
          Adjust image framing
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Preview matches the storefront product card. Drag the image to reposition
          it, or use the sliders below.
        </p>

        <div className="mt-5">
          <div
            className={`relative mx-auto max-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-neutral-100 shadow-sm ${
              fitMode === "cover" ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <ProductFramedPreview
              src={previewUrl}
              alt={image.alt || "Product image preview"}
              focalX={focalX}
              focalY={focalY}
              zoom={zoom}
              fitMode={fitMode}
              className="aspect-[4/5] w-full"
            />
            {fitMode === "cover" && (
              <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white">
                <Move className="h-3 w-3" />
                Drag to reposition
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFitMode("cover")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                fitMode === "cover"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Fill frame
            </button>
            <button
              type="button"
              onClick={() => setFitMode("contain")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                fitMode === "contain"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Show full image
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-focal-x">Horizontal position</Label>
            <input
              id="image-focal-x"
              type="range"
              min={0}
              max={100}
              value={focalX}
              disabled={fitMode === "contain"}
              onChange={(e) => setFocalX(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-focal-y">Vertical position</Label>
            <input
              id="image-focal-y"
              type="range"
              min={0}
              max={100}
              value={focalY}
              disabled={fitMode === "contain"}
              onChange={(e) => setFocalY(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-zoom">Zoom ({zoom}%)</Label>
            <input
              id="image-zoom"
              type="range"
              min={100}
              max={200}
              step={5}
              value={zoom}
              disabled={fitMode === "contain"}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save framing
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
