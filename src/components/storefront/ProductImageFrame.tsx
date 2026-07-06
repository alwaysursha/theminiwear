import type { ReactNode } from "react";
import Image from "next/image";
import { cn, shouldBypassImageOptimization } from "@/lib/utils";
import type { ProductImageFitMode } from "@/lib/product-image-display";

export type ProductImageFrameTone = "warm" | "cool" | "sale" | "neutral" | "light";

const fitZoom = {
  sm: {
    base: "scale-[1.1]",
    hover: "group-hover/frame:scale-[1.13]",
  },
  md: {
    base: "scale-[1.14]",
    hover: "group-hover/frame:scale-[1.17]",
  },
  lg: {
    base: "scale-[1.16]",
    hover: "group-hover/frame:scale-[1.19]",
  },
} as const;

type ProductFitImageProps = {
  src: string;
  alt: string;
  sizes: string;
  fit?: keyof typeof fitZoom;
  mode?: "contain" | "cover";
  focalX?: number;
  focalY?: number;
  zoom?: number;
  fitMode?: ProductImageFitMode;
  className?: string;
};

/** Product image fit — contain for catalog cards, cover for edge-to-edge hero tiles. */
export function ProductFitImage({
  src,
  alt,
  sizes,
  fit = "md",
  mode = "contain",
  focalX = 50,
  focalY = 50,
  zoom = 100,
  fitMode,
  className,
}: ProductFitImageProps) {
  const zoomConfig = fitZoom[fit];
  const effectiveMode = fitMode ?? mode;
  const scale = effectiveMode === "cover" ? Math.max(1, zoom / 100) : 1;

  if (effectiveMode === "cover") {
    return (
      <div className="product-fit-image relative h-full min-h-0 w-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500 ease-out group-hover/frame:scale-[1.03]",
            scale > 1 && "will-change-transform",
          )}
          style={
            scale > 1
              ? {
                  transform: `scale(${scale})`,
                  transformOrigin: `${focalX}% ${focalY}%`,
                }
              : undefined
          }
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            unoptimized={shouldBypassImageOptimization(src)}
            className={cn("object-cover", className)}
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="product-fit-image relative h-full min-h-0 w-full overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={shouldBypassImageOptimization(src)}
        className={cn(
          "object-center transition-transform duration-500 ease-out",
          "origin-center object-contain",
          zoomConfig.base,
          zoomConfig.hover,
          className,
        )}
      />
    </div>
  );
}

const tones: Record<
  ProductImageFrameTone,
  { outer: string; inner: string; glow: string; hover: string }
> = {
  warm: {
    outer: "from-coral/30 via-blush/45 to-white",
    inner: "ring-coral/20",
    glow: "from-blush/40",
    hover: "group-hover/frame:shadow-[0_8px_28px_rgba(255,107,90,0.18)]",
  },
  cool: {
    outer: "from-mint/35 via-sky/30 to-white",
    inner: "ring-mint/25",
    glow: "from-sky/35",
    hover: "group-hover/frame:shadow-[0_8px_28px_rgba(94,200,180,0.2)]",
  },
  sale: {
    outer: "from-coral/25 via-blush/50 to-white",
    inner: "ring-coral/30",
    glow: "from-coral/15",
    hover: "group-hover/frame:shadow-[0_8px_28px_rgba(255,107,90,0.2)]",
  },
  neutral: {
    outer: "from-navy/8 via-blush/25 to-sky/20",
    inner: "ring-navy/10",
    glow: "from-white",
    hover: "group-hover/frame:shadow-[0_8px_24px_rgba(26,38,66,0.12)]",
  },
  light: {
    outer: "from-white via-white/95 to-white/80",
    inner: "ring-white/50",
    glow: "from-white/80",
    hover: "group-hover/frame:shadow-[0_6px_20px_rgba(255,255,255,0.25)]",
  },
};

type ProductImageFrameProps = {
  children: ReactNode;
  tone?: ProductImageFrameTone;
  size?: "sm" | "md" | "lg";
  flush?: boolean;
  className?: string;
};

export function ProductImageFrame({
  children,
  tone = "neutral",
  size = "md",
  flush = false,
  className,
}: ProductImageFrameProps) {
  if (flush) {
    return (
      <div
        className={cn(
          "relative h-full min-h-0 w-full overflow-hidden bg-neutral-100",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  const palette = tones[tone];

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden bg-gradient-to-br shadow-[0_4px_18px_rgba(26,38,66,0.08)] transition-shadow duration-500",
        palette.hover,
        palette.outer,
        size === "sm" && "rounded-lg p-[2px] sm:p-[3px]",
        size === "md" && "rounded-xl p-[3px] sm:p-1",
        size === "lg" && "rounded-2xl p-1 sm:p-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full min-h-0 overflow-hidden bg-white ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]",
          palette.inner,
          size === "sm" && "rounded-[6px]",
          size === "md" && "rounded-[10px] sm:rounded-[11px]",
          size === "lg" && "rounded-xl sm:rounded-2xl",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_38%,var(--tw-gradient-from),transparent_72%)]",
            palette.glow,
          )}
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}
