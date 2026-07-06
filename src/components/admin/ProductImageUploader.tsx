"use client";

import { useRef, useState } from "react";
import { Crop, GripVertical, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import type { ProductImageInput } from "@/lib/actions/products";
import { ProductImageAdjustDialog } from "@/components/admin/ProductImageAdjustDialog";
import { ProductFramedPreview } from "@/components/storefront/ProductFramedPreview";
import {
  defaultProductImageFraming,
  normalizeProductImageFraming,
} from "@/lib/product-image-display";

type Props = {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  colors: string[];
};

const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif";

export function ProductImageUploader({ images, onChange, colors }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [adjustIndex, setAdjustIndex] = useState<number | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  async function uploadOne(file: File): Promise<string | null> {
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Upload failed");
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setError(null);
    setUploading((n) => n + files.length);

    const results = await Promise.allSettled(files.map((f) => uploadOne(f)));
    setUploading((n) => Math.max(0, n - files.length));

    const defaults = defaultProductImageFraming();
    const uploaded: ProductImageInput[] = [];
    const newPreviews: Record<string, string> = {};
    let hadFailure = false;
    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        const url = result.value;
        uploaded.push({
          url,
          alt: "",
          color: "",
          sortOrder: "",
          focalX: defaults.focalX,
          focalY: defaults.focalY,
          zoom: defaults.zoom,
          fitMode: defaults.fitMode,
        });
        newPreviews[url] = URL.createObjectURL(files[i]);
      } else {
        hadFailure = true;
      }
    });

    if (Object.keys(newPreviews).length > 0) {
      setPreviews((prev) => ({ ...prev, ...newPreviews }));
    }
    if (hadFailure) setError("Some images couldn't be uploaded. Please try again.");
    if (uploaded.length > 0) {
      const base = images.length;
      onChange([
        ...images,
        ...uploaded.map((img, i) => ({ ...img, sortOrder: String(base + i) })),
      ]);
      setAdjustIndex(base);
    }
  }

  function update(index: number, patch: Partial<ProductImageInput>) {
    const next = images.map((img, i) => (i === index ? { ...img, ...patch } : img));
    onChange(next);
  }

  function remove(index: number) {
    if (adjustIndex === index) setAdjustIndex(null);
    onChange(images.filter((_, i) => i !== index));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((img, i) => ({ ...img, sortOrder: String(i) })));
  }

  const adjustingImage = adjustIndex !== null ? images[adjustIndex] : null;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver
            ? "border-slate-900 bg-slate-50"
            : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <UploadCloud className="h-6 w-6 text-slate-500" />
        </span>
        <p className="text-sm font-semibold text-slate-700">
          Drag &amp; drop images here, or click to browse
        </p>
        <p className="text-xs text-slate-400">
          PNG, JPG, WEBP or GIF · up to 5MB · adjust framing before saving
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {uploading > 0 && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading {uploading} image{uploading > 1 ? "s" : ""}…
        </p>
      )}

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            const framing = normalizeProductImageFraming(image);
            const previewUrl = previews[image.url] ?? image.url;

            return (
              <div
                key={image.id ?? `img-${index}-${image.url}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, index);
                  setDragIndex(null);
                }}
                className={`group relative rounded-xl border bg-white p-2 shadow-sm transition-all ${
                  dragIndex === index ? "opacity-50" : "border-slate-200"
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-slate-100">
                  {image.url ? (
                    <ProductFramedPreview
                      src={previewUrl}
                      alt={image.alt || "Product image"}
                      focalX={framing.focalX}
                      focalY={framing.focalY}
                      zoom={framing.zoom}
                      fitMode={framing.fitMode}
                      className="h-full w-full"
                      sizes="200px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute left-1.5 top-1.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-white/90 text-slate-400 shadow-sm">
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                  {index === 0 && (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setAdjustIndex(index)}
                    className="absolute bottom-1.5 left-1.5 flex h-7 items-center gap-1 rounded-md bg-white/90 px-2 text-[10px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-900 hover:text-white"
                  >
                    <Crop className="h-3 w-3" />
                    Adjust
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 space-y-1.5">
                  <select
                    value={image.color ?? ""}
                    onChange={(e) => update(index, { color: e.target.value })}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                    title="Link this image to a color"
                  >
                    <option value="">All colors</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    value={image.alt ?? ""}
                    onChange={(e) => update(index, { alt: e.target.value })}
                    placeholder="Alt text (optional)"
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No images yet.</p>
      )}

      {adjustingImage && adjustIndex !== null && (
        <ProductImageAdjustDialog
          open
          image={adjustingImage}
          previewUrl={previews[adjustingImage.url] ?? adjustingImage.url}
          onClose={() => setAdjustIndex(null)}
          onSave={(patch) => update(adjustIndex, patch)}
        />
      )}
    </div>
  );
}
