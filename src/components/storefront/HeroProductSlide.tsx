import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  HeroDuoSpotlightSlide,
  HeroFeatureSlide,
  HeroProductAdSlide,
  HeroProductItem,
  HeroShowcaseSlide,
} from "@/lib/hero-slider";
import {
  ProductFitImage,
  ProductImageFrame,
} from "@/components/storefront/ProductImageFrame";
import { SaleOffBadge } from "@/components/storefront/SaleOffBadge";
import { ViewAllLink } from "@/components/storefront/ViewAllLink";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adThemes = {
  fresh: {
    header: "bg-navy text-white",
    headerPill: "bg-mint text-navy",
  },
  sale: {
    header: "bg-coral text-white",
    headerPill: "bg-white text-coral",
  },
  trending: {
    header: "bg-navy text-white",
    headerPill: "bg-coral text-white",
  },
} as const;

function ProductThumb({
  product,
  className,
  size = "md",
  badgeSize = "sm",
}: {
  product: HeroProductItem;
  className?: string;
  size?: "sm" | "md" | "lg";
  badgeSize?: "sm" | "md";
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("group/frame block min-h-0 w-full", className)}
    >
      <ProductImageFrame flush size={size} className="h-full">
        <div className="relative h-full min-h-0">
          {product.discountPercent != null && (
            <SaleOffBadge
              percent={product.discountPercent}
              size={badgeSize}
              className="right-1.5 top-1.5 z-10 scale-75 sm:scale-90"
            />
          )}
          {product.imageUrl ? (
            <ProductFitImage
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              sizes="220px"
              mode="cover"
            />
          ) : (
            <div className="flex h-full min-h-[5rem] items-center justify-center text-3xl">
              👕
            </div>
          )}
        </div>
      </ProductImageFrame>
    </Link>
  );
}

function AdShell({
  slide,
  children,
}: {
  slide: HeroProductAdSlide;
  children: ReactNode;
}) {
  const theme = adThemes[slide.theme];

  const headerRight =
    slide.variant === "showcase" || slide.variant === "feature" ? (
      <ViewAllLink
        href={slide.viewAllHref}
        tone="mint"
        size="xs"
        className="text-white/95 hover:text-white"
      >
        {slide.viewAllLabel}
      </ViewAllLink>
    ) : (
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-[10px]">
        {slide.variant === "duo-spotlight" ? "Bundle the look" : "2 picks · Shop now"}
      </span>
    );

  const isBorderless = slide.variant === "showcase" || slide.variant === "feature";

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-white">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden rounded-xl sm:rounded-2xl",
            !isBorderless && "border border-navy/10",
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-between gap-2 rounded-t-xl px-3 py-2 sm:rounded-t-2xl sm:px-4",
              theme.header,
            )}
          >
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]",
                theme.headerPill,
              )}
            >
              {slide.tag}
            </span>
            {headerRight}
          </div>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-hidden rounded-b-xl bg-white sm:rounded-b-2xl",
              !isBorderless && "border-t border-navy/10",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniProductCell({
  product,
  className,
}: {
  product: HeroProductItem;
  className?: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group/frame flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-navy/10 bg-white transition-shadow hover:shadow-sm sm:rounded-lg",
        className,
      )}
    >
      <div className="relative min-h-0 flex-1">
        <ProductImageFrame flush size="sm" className="h-full">
          <div className="relative h-full min-h-0">
            {product.discountPercent != null && (
              <SaleOffBadge
                percent={product.discountPercent}
                size="sm"
                className="absolute right-0.5 top-0.5 z-10 scale-[0.65] sm:scale-75"
              />
            )}
            {product.imageUrl ? (
              <ProductFitImage
                src={product.imageUrl}
                alt={product.imageAlt ?? product.name}
                sizes="120px"
                mode="cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xl">👕</div>
            )}
          </div>
        </ProductImageFrame>
      </div>
      <div className="shrink-0 border-t border-navy/10 px-1.5 py-1 sm:px-2">
        <p className="line-clamp-1 font-display text-[9px] font-bold leading-tight text-navy sm:text-[10px]">
          {product.name}
        </p>
        <p className="font-display text-[10px] font-extrabold text-coral sm:text-xs">
          {product.priceDisplay}
        </p>
      </div>
    </Link>
  );
}

function splitProductName(name: string): { lead: string; accent: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { lead: name, accent: "" };
  }
  return {
    lead: parts[0] ?? name,
    accent: parts.slice(1).join(" "),
  };
}

/** New arrival — fancy copy left, hero image right */
function FeatureLayout({ slide }: { slide: HeroFeatureSlide }) {
  const { product } = slide;
  const { lead, accent } = splitProductName(product.name);

  return (
    <AdShell slide={slide}>
      <div className="grid h-full min-h-0 grid-cols-[1fr_1.05fr] gap-2 bg-white p-2 sm:gap-3 sm:p-3">
        <div className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-mint/35 via-mint/10 to-blush/40 px-4 py-4 sm:rounded-xl sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-coral/25 blur-xl" />

          <div className="relative z-10 flex flex-col items-start text-left">
            {product.categoryName && (
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-navy/45 sm:text-xs">
                {product.categoryName}
              </p>
            )}

            <h3 className="mt-2 font-display text-2xl font-extrabold leading-[1.06] text-navy sm:mt-3 sm:text-4xl lg:text-[2.75rem]">
              {lead}
              {accent ? (
                <>
                  <br />
                  <span className="text-coral">{accent}</span>
                </>
              ) : null}
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
              <p className="font-display text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
                {product.priceDisplay}
              </p>
              {product.discountPercent != null && (
                <span className="rounded-full bg-coral px-3 py-1 text-xs font-bold text-white sm:text-sm">
                  {product.discountPercent}% off
                </span>
              )}
            </div>

            <Link
              href={`/product/${product.slug}`}
              className={cn(
                buttonVariants({ size: "default" }),
                "mt-5 h-10 w-auto self-start px-7 text-sm sm:mt-6 sm:h-11 sm:px-8 sm:text-base",
              )}
            >
              Buy now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="group/frame relative block min-h-0 h-full overflow-hidden rounded-lg sm:rounded-xl"
        >
          <ProductImageFrame flush size="lg" className="absolute inset-0 h-full w-full">
            <div className="relative h-full min-h-0">
              {product.imageUrl ? (
                <ProductFitImage
                  src={product.imageUrl}
                  alt={product.imageAlt ?? product.name}
                  sizes="(max-width: 768px) 50vw, 480px"
                  mode="cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-blush/20 text-5xl">
                  👕
                </div>
              )}
            </div>
          </ProductImageFrame>
        </Link>
      </div>
    </AdShell>
  );
}

/** Design B — spotlight + companion */
function DuoSpotlightLayout({ slide }: { slide: HeroDuoSpotlightSlide }) {
  const [hero, companion] = slide.products;

  return (
    <AdShell slide={slide}>
      <div className="grid h-full min-h-0 grid-cols-[1.15fr_0.85fr] gap-2 bg-white p-2 sm:gap-3 sm:p-3">
        <article className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-navy/10 bg-white sm:rounded-xl">
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-coral px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
            Top pick
          </span>
          <ProductThumb product={hero} className="min-h-0 flex-1" />
          <div className="shrink-0 space-y-1 p-2 sm:p-2.5">
            <h3 className="line-clamp-2 font-display text-xs font-extrabold leading-tight text-navy sm:text-sm">
              {hero.name}
            </h3>
            <p className="font-display text-base font-extrabold text-coral sm:text-lg">
              {hero.priceDisplay}
            </p>
            <Link
              href={`/product/${hero.slug}`}
              className={cn(buttonVariants({ size: "sm" }), "h-8 w-auto self-start px-3.5 text-[11px] sm:h-9 sm:px-4")}
            >
              Shop now
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-navy/10 bg-white sm:rounded-xl">
          <ProductThumb product={companion} className="min-h-0 flex-1" />
          <div className="shrink-0 space-y-1 p-2 sm:p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-coral sm:text-[9px]">
              Also love
            </p>
            <h3 className="line-clamp-2 font-display text-[11px] font-bold leading-tight text-navy sm:text-xs">
              {companion.name}
            </h3>
            <p className="text-sm font-extrabold text-navy sm:text-base">{companion.priceDisplay}</p>
            <Link
              href={`/product/${companion.slug}`}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "h-8 w-auto self-start px-3.5 text-[11px] sm:h-9 sm:px-4",
              )}
            >
              View
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </article>
      </div>
    </AdShell>
  );
}

/** Top pick + 4 small products — shared by on-sale and trending slides */
function ShowcaseTopPickCard({ product }: { product: HeroProductItem }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group/frame relative block h-full min-h-0 overflow-hidden rounded-lg sm:rounded-xl"
    >
      <ProductImageFrame flush size="lg" className="absolute inset-0 h-full w-full">
        <div className="relative h-full min-h-0">
          {product.discountPercent != null && (
            <SaleOffBadge
              percent={product.discountPercent}
              size="md"
              className="absolute right-2 top-2 z-20 scale-90 sm:scale-100"
            />
          )}
          {product.imageUrl ? (
            <ProductFitImage
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              sizes="(max-width: 768px) 55vw, 420px"
              mode="cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-blush/30 text-5xl">
              👕
            </div>
          )}
        </div>
      </ProductImageFrame>

      <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-coral px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white sm:left-3 sm:top-3">
        Top pick
      </span>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy/92 via-navy/60 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-16">
        <h3 className="line-clamp-2 font-display text-sm font-extrabold leading-tight text-white drop-shadow-md sm:text-base">
          {product.name}
        </h3>
        <p className="mt-1 font-display text-xl font-extrabold text-coral drop-shadow-sm sm:text-2xl">
          {product.priceDisplay}
        </p>
      </div>
    </Link>
  );
}

function ShowcaseLayout({ slide }: { slide: HeroShowcaseSlide }) {
  const gridSlots = Array.from({ length: 4 }, (_, index) => slide.gridProducts[index] ?? null);

  return (
    <AdShell slide={slide}>
      <div className="grid h-full min-h-0 grid-cols-[1.05fr_0.95fr] gap-2 bg-white p-2 sm:gap-3 sm:p-3">
        <article className="relative min-h-0 h-full overflow-hidden rounded-lg sm:rounded-xl">
          <ShowcaseTopPickCard product={slide.topPick} />
        </article>

        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg p-1 sm:rounded-xl sm:p-1.5">
          <p className="shrink-0 px-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-navy/55 sm:text-[9px]">
            {slide.gridLabel}
          </p>
          <div className="mt-1 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 sm:mt-1.5 sm:gap-2">
            {gridSlots.map((product, index) =>
              product ? (
                <MiniProductCell key={product.slug} product={product} />
              ) : (
                <div
                  key={`empty-${index}`}
                  className="h-full min-h-0 rounded-md border border-dashed border-navy/10 bg-white sm:rounded-lg"
                  aria-hidden
                />
              ),
            )}
          </div>
        </div>
      </div>
    </AdShell>
  );
}

export function HeroProductSlideView({ slide }: { slide: HeroProductAdSlide }) {
  switch (slide.variant) {
    case "feature":
      return <FeatureLayout slide={slide} />;
    case "showcase":
      return <ShowcaseLayout slide={slide} />;
    case "duo-spotlight":
      return <DuoSpotlightLayout slide={slide} />;
    default: {
      const _exhaustive: never = slide;
      return _exhaustive;
    }
  }
}
