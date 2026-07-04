import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
}: {
  product: HeroProductItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn("group/frame block min-h-0 w-full", className)}
    >
      <ProductImageFrame flush size={size} className="h-full">
        <div className="relative h-full min-h-0">
          {product.discountPercent != null && (
            <SaleOffBadge percent={product.discountPercent} size="sm" />
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
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-3 py-1.5 sm:px-6 sm:py-3 lg:px-8">
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

function ShowcaseGridCell({ product }: { product: HeroProductItem }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group/frame relative block h-full w-full min-h-0 overflow-hidden rounded-lg border border-navy/10 bg-white transition-shadow hover:shadow-md sm:rounded-xl"
    >
      <ProductImageFrame flush size="md" className="absolute inset-0 h-full w-full">
        <div className="relative h-full min-h-0">
          {product.discountPercent != null && (
            <SaleOffBadge percent={product.discountPercent} size="xs" />
          )}
          {product.imageUrl ? (
            <ProductFitImage
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              sizes="(max-width: 640px) 44vw, 200px"
              mode="cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-blush/20 text-2xl sm:text-3xl">
              👕
            </div>
          )}
        </div>
      </ProductImageFrame>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-navy/90 via-navy/55 to-transparent px-2 pb-2 pt-6 sm:px-2.5 sm:pb-2.5 sm:pt-8">
        <p className="line-clamp-1 font-display text-[10px] font-bold leading-tight text-white sm:text-xs">
          {product.name}
        </p>
        <p className="font-display text-[11px] font-extrabold text-coral sm:text-sm">
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

/** New arrival — editorial spotlight with premium copy + hero image */
function FeatureLayout({ slide }: { slide: HeroFeatureSlide }) {
  const { product } = slide;
  const { lead, accent } = splitProductName(product.name);

  return (
    <div className="hero-feature relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-[#fffaf9] via-blush/25 to-sky/30">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-mint/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-sky/30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3 sm:mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-coral/25 bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-coral shadow-[0_4px_20px_rgba(255,127,110,0.18)] backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-[11px]">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            {slide.tag}
          </span>
          <ViewAllLink
            href={slide.viewAllHref}
            tone="coral"
            size="xs"
            className="text-navy/55 hover:text-coral"
          >
            {slide.viewAllLabel}
          </ViewAllLink>
        </div>

        <div className="hero-feature-stack grid min-h-0 flex-1 grid-cols-1 gap-4 max-lg:gap-0 sm:gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-8">
          <div className="hero-feature-copy-frame relative mx-1 max-lg:mx-0 sm:mx-2 lg:mx-0">
            <div className="hero-feature-copy relative flex flex-col justify-center p-5 max-lg:p-5 lg:p-8">
              <span className="hero-feature-corner hero-feature-corner-tl" aria-hidden />
              <span className="hero-feature-corner hero-feature-corner-tr" aria-hidden />
              <span className="hero-feature-corner hero-feature-corner-bl" aria-hidden />
              <span className="hero-feature-corner hero-feature-corner-br" aria-hidden />

              <div
                className="hero-feature-copy-sheen pointer-events-none absolute bg-gradient-to-br from-white/50 via-transparent to-coral/[0.07]"
                aria-hidden
              />

              <div className="relative z-10">
                {product.categoryName && (
                  <p className="hero-feature-eyebrow text-[10px] font-bold uppercase text-navy/50 sm:text-[11px]">
                    {product.categoryName}
                  </p>
                )}

                <h3 className="hero-feature-title mt-2.5 max-lg:mt-1.5 text-navy sm:mt-3.5">
                  <span className="block">{lead}</span>
                  {accent ? (
                    <span className="hero-feature-title-accent mt-0.5 block">
                      {accent}
                    </span>
                  ) : null}
                </h3>

                <div className="mt-4 max-lg:mt-2 sm:mt-5">
                  <div className="hero-feature-price-rule" aria-hidden />
                  <div className="hero-feature-price-row mt-3 max-lg:mt-2 flex flex-wrap items-end gap-2.5">
                    <p className="hero-feature-price text-navy">
                      {product.priceDisplay}
                    </p>
                    {product.discountPercent != null && (
                      <SaleOffBadge
                        percent={product.discountPercent}
                        size="sm"
                        inline
                      />
                    )}
                  </div>
                </div>

                <p className="hero-feature-body mt-3 max-lg:mt-2 max-w-sm max-lg:max-w-none text-navy/58 sm:mt-4">
                  Fresh off the rack — soft fabrics, easy fits, and everyday magic
                  for little ones.
                </p>

                <Link
                  href={`/product/${product.slug}`}
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "hero-feature-cta mt-5 hidden h-11 w-full px-7 text-sm font-bold shadow-[0_14px_36px_rgba(255,127,110,0.38)] sm:mt-6 sm:h-12 lg:inline-flex lg:w-auto lg:px-9 lg:text-base",
                  )}
                >
                  Shop this drop
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-feature-visual group/frame relative mx-auto flex h-full min-h-[14rem] max-lg:min-h-0 w-full max-w-lg items-center justify-center sm:max-lg:min-h-0 lg:mx-0 lg:max-w-none lg:min-h-0">
            <div
              className="pointer-events-none absolute inset-[8%] rounded-[2rem] bg-coral/15 blur-2xl transition-transform duration-700 group-hover/frame:scale-105"
              aria-hidden
            />

            <div className="hero-feature-visual-card relative aspect-[4/5] w-full max-w-[min(100%,22rem)] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white ring-1 ring-navy/5 sm:max-w-[min(100%,26rem)] sm:rounded-[2rem] lg:max-w-none">
              <Link
                href={`/product/${product.slug}`}
                className="absolute inset-0 z-0"
                aria-label={`View ${product.name}`}
              />

              {product.imageUrl ? (
                <>
                  <ProductFitImage
                    src={product.imageUrl}
                    alt={product.imageAlt ?? product.name}
                    sizes="(max-width: 1024px) 90vw, 520px"
                    fit="lg"
                    mode="cover"
                    className="transition-transform duration-700 ease-out group-hover/frame:scale-[1.03]"
                  />
                  <div
                    className="hero-feature-shimmer pointer-events-none absolute inset-0 z-10"
                    aria-hidden
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blush/40 via-sky/20 to-mint/30 text-6xl">
                  👕
                </div>
              )}

              {product.discountPercent != null && (
                <SaleOffBadge
                  percent={product.discountPercent}
                  size="md"
                  className="left-4 top-4 z-20 sm:left-5 sm:top-5"
                />
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden bg-gradient-to-t from-navy/75 via-navy/25 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-20 lg:block">
                <p className="line-clamp-1 font-display text-sm font-bold text-white sm:text-base">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-white/75">
                  Tap to view details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-feature-mobile-cta lg:hidden">
        <div className="hero-feature-shop-scrim" aria-hidden />
        <Link
          href={`/product/${product.slug}`}
          className="hero-feature-shop-link"
        >
          <span className="hero-feature-shop-link-text">
            <span className="hero-feature-shop-link-quiet">Shop this </span>
            <span className="hero-feature-shop-link-accent">drop</span>
          </span>
          <ArrowRight className="hero-feature-shop-link-arrow" aria-hidden />
        </Link>
      </div>
    </div>
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
            <SaleOffBadge percent={product.discountPercent} size="md" />
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
      <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(8rem,0.82fr)_minmax(0,1.18fr)] gap-2 bg-white p-2 sm:grid-cols-[0.9fr_1.1fr] sm:grid-rows-1 sm:gap-3 sm:p-3">
        <article className="relative h-full min-h-0 overflow-hidden rounded-lg sm:rounded-xl">
          <ShowcaseTopPickCard product={slide.topPick} />
        </article>

        <div className="flex min-h-0 flex-col justify-center overflow-hidden rounded-lg p-1 sm:h-full sm:justify-center sm:rounded-xl sm:p-1.5">
          <p className="shrink-0 px-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-navy/55 sm:text-[9px]">
            {slide.gridLabel}
          </p>
          <div className="mt-1.5 flex w-full min-h-0 flex-1 items-center justify-center sm:mt-2">
            <div className="grid aspect-square w-full max-h-full min-h-0 max-w-full grid-cols-2 grid-rows-2 gap-2 sm:gap-2.5">
              {gridSlots.map((product, index) =>
                product ? (
                  <ShowcaseGridCell key={product.slug} product={product} />
                ) : (
                  <div
                    key={`empty-${index}`}
                    className="h-full w-full rounded-lg border border-dashed border-navy/10 bg-white sm:rounded-xl"
                    aria-hidden
                  />
                ),
              )}
            </div>
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
