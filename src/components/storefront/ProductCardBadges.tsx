import { Badge } from "@/components/ui/badge";
import { SaleCountdownOverlay } from "@/components/storefront/SaleCountdownOverlay";
import { SaleOffBadge } from "@/components/storefront/SaleOffBadge";
import { cn } from "@/lib/utils";

const compactBadgeClass =
  "px-1.5 py-0 text-[10px] leading-5 sm:px-2.5 sm:py-0.5 sm:text-xs";

export type ProductCardFlagSource = {
  isNewArrival: boolean;
  isTrending: boolean;
  isClearance: boolean;
};

export function ProductCardStatusFlags({
  product,
  className,
}: {
  product: ProductCardFlagSource;
  className?: string;
}) {
  const flags: {
    key: string;
    variant: "clearance" | "new" | "trending";
    label: string;
  }[] = [];

  if (product.isClearance) {
    flags.push({ key: "clearance", variant: "clearance", label: "Clearance" });
  }
  if (product.isNewArrival) {
    flags.push({ key: "new", variant: "new", label: "New" });
  }
  if (product.isTrending) {
    flags.push({ key: "trending", variant: "trending", label: "Trending" });
  }

  if (flags.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      aria-label="Product highlights"
    >
      {flags.map((flag) => (
        <Badge
          key={flag.key}
          variant={flag.variant}
          className={compactBadgeClass}
        >
          {flag.label}
        </Badge>
      ))}
    </div>
  );
}

export function ProductCardSaleOverlays({
  maxDiscountPercent,
  saleEndsAt,
}: {
  maxDiscountPercent: number | null;
  saleEndsAt: Date | null;
}) {
  return (
    <>
      {maxDiscountPercent != null && (
        <SaleOffBadge
          percent={maxDiscountPercent}
          size="sm"
          className="right-1.5 top-1.5 sm:right-2.5 sm:top-2.5"
        />
      )}
      {saleEndsAt && <SaleCountdownOverlay endsAt={saleEndsAt} />}
    </>
  );
}
