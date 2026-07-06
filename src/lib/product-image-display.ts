export type ProductImageFitMode = "cover" | "contain";

export type ProductImageFraming = {
  focalX: number;
  focalY: number;
  zoom: number;
  fitMode: ProductImageFitMode;
};

export function normalizeProductImageFraming(input?: {
  focalX?: number | string | null;
  focalY?: number | string | null;
  zoom?: number | string | null;
  fitMode?: string | null;
}): ProductImageFraming {
  const focalX = clampPercent(Number(input?.focalX ?? 50));
  const focalY = clampPercent(Number(input?.focalY ?? 50));
  const zoom = clampZoom(Number(input?.zoom ?? 100));
  const fitMode = input?.fitMode === "contain" ? "contain" : "cover";

  return { focalX, focalY, zoom, fitMode };
}

export function defaultProductImageFraming(): ProductImageFraming {
  return { focalX: 50, focalY: 50, zoom: 100, fitMode: "cover" };
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampZoom(value: number) {
  if (!Number.isFinite(value)) return 100;
  return Math.min(200, Math.max(100, Math.round(value)));
}
