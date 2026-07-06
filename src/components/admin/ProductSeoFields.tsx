"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProductSeoFieldsProps = {
  productName: string;
  description: string;
  initialMetaTitle?: string | null;
  initialMetaDescription?: string | null;
  initialOgImageUrl?: string | null;
};

const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif";

export function ProductSeoFields({
  productName,
  description,
  initialMetaTitle = "",
  initialMetaDescription = "",
  initialOgImageUrl = "",
}: ProductSeoFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ogImageUrl, setOgImageUrl] = useState(initialOgImageUrl ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadOgImage(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      setOgImageUrl(data.url);
      setPreview(URL.createObjectURL(file));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = preview ?? (ogImageUrl || null);

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Search &amp; social</h3>
        <p className="mt-1 text-xs text-slate-500">
          Optional overrides for Google and social previews. Leave blank to use
          the product name, description, and auto-generated share image.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaTitle">SEO title</Label>
        <Input
          id="metaTitle"
          name="metaTitle"
          defaultValue={initialMetaTitle ?? ""}
          placeholder={productName || "Uses product name when empty"}
          className="rounded-md border-slate-200 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">SEO description</Label>
        <Textarea
          id="metaDescription"
          name="metaDescription"
          defaultValue={initialMetaDescription ?? ""}
          placeholder={
            description
              ? description.slice(0, 120)
              : "Uses product description when empty"
          }
          rows={3}
          className="rounded-md border-slate-200 bg-white"
        />
        <p className="text-xs text-slate-400">Aim for 120–160 characters.</p>
      </div>

      <div className="space-y-2">
        <Label>Social share image</Label>
        <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative aspect-[1200/630] w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Social share preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-slate-400">
                <ImagePlus className="h-8 w-8" />
                <p className="text-xs">Auto-generated at 1200×630 if empty</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              Upload custom image
            </button>
            {ogImageUrl ? (
              <button
                type="button"
                onClick={() => {
                  setOgImageUrl("");
                  setPreview(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Use auto-generated image
              </button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadOgImage(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
