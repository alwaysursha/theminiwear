import Image from "next/image";
import { cn, shouldBypassImageOptimization } from "@/lib/utils";
import type { ProductImageFitMode } from "@/lib/product-image-display";

type ProductFramedPreviewProps = {
  src: string;
  alt: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
  fitMode?: ProductImageFitMode;
  className?: string;
  sizes?: string;
  interactive?: boolean;
};

export function ProductFramedPreview({
  src,
  alt,
  focalX = 50,
  focalY = 50,
  zoom = 100,
  fitMode = "cover",
  className,
  sizes = "240px",
  interactive = false,
}: ProductFramedPreviewProps) {
  const scale = fitMode === "cover" ? Math.max(1, zoom / 100) : 1;

  if (fitMode === "contain") {
    return (
      <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={shouldBypassImageOptimization(src)}
          className={cn(
            "object-contain object-center",
            interactive && "transition-transform duration-300",
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      <div
        className={cn(
          "absolute inset-0",
          interactive && "transition-transform duration-300",
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
          className="object-cover"
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
        />
      </div>
    </div>
  );
}
