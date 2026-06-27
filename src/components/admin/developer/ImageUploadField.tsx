"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  defaultUrl?: string | null;
  aspectRatio?: number;
};

async function cropImageToBlob(
  file: File,
  aspectRatio: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const sourceRatio = bitmap.width / bitmap.height;
  let cropWidth = bitmap.width;
  let cropHeight = bitmap.height;

  if (sourceRatio > aspectRatio) {
    cropWidth = Math.round(bitmap.height * aspectRatio);
  } else {
    cropHeight = Math.round(bitmap.width / aspectRatio);
  }

  const sx = Math.round((bitmap.width - cropWidth) / 2);
  const sy = Math.round((bitmap.height - cropHeight) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      file.type === "image/png" ? "image/png" : "image/jpeg",
      0.92,
    );
  });
}

export function ImageUploadField({
  label,
  name,
  defaultUrl = "",
  aspectRatio = 16 / 9,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const cropped = await cropImageToBlob(file, aspectRatio);
      const formData = new FormData();
      formData.append("file", cropped, file.name);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://... or upload below"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          className="max-w-xs"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {uploading && (
          <span className="text-xs text-slate-500">Uploading…</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {url && (
        <div className="relative mt-2 h-40 w-full max-w-md overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={url.startsWith("/cms-uploads")}
          />
        </div>
      )}
      <p className="text-xs text-slate-500">
        Uploads are center-cropped to fit. You can also paste an image URL.
      </p>
    </div>
  );
}
