import Link from "next/link";
import { Tag, Star } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ViewAllLink } from "@/components/storefront/ViewAllLink";
import type { HomepageSectionData } from "@/lib/cms/types";
import type { ProductWithRelations } from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type HomepageProductSectionProps = {
  section: HomepageSectionData;
  products: ProductWithRelations[];
  siteSale: SiteSaleSettings;
  variant?: "default" | "sale" | "clearance" | "trending";
  saleTitle?: string;
};

export function HomepageProductSection({
  section,
  products,
  siteSale,
  variant = "default",
  saleTitle,
}: HomepageProductSectionProps) {
  if (!section.enabled || products.length === 0) return null;

  const title = saleTitle ?? section.title;

  return (
    <section
      className={cn(
        "py-14",
        variant === "sale" && "bg-blush/30",
        variant === "clearance" && "bg-navy text-white",
        variant === "trending" && "bg-gradient-to-b from-mint/20 to-transparent",
        variant === "default" && "bg-white",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            {variant === "sale" && <Tag className="h-6 w-6 text-coral" />}
            {variant === "trending" && (
              <Star className="h-6 w-6 fill-coral text-coral" />
            )}
            <div>
              {section.eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
                  {section.eyebrow}
                </p>
              )}
              <h2
                className={cn(
                  "font-display text-2xl font-bold sm:text-3xl",
                  variant === "clearance" ? "text-white" : "text-navy",
                )}
              >
                {title}
              </h2>
              {section.description && (
                <p
                  className={cn(
                    "mt-1",
                    variant === "clearance" ? "text-white/70" : "text-navy/60",
                  )}
                >
                  {section.description}
                </p>
              )}
            </div>
          </div>
          {section.viewAllHref && section.viewAllLabel && (
            <ViewAllLink
              href={section.viewAllHref}
              tone={variant === "clearance" ? "mint" : "coral"}
              className="hidden sm:inline-flex"
            >
              {section.viewAllLabel}
            </ViewAllLink>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} siteSale={siteSale} />
          ))}
        </div>
      </div>
    </section>
  );
}
