import Link from "next/link";
import { ViewAllLink } from "@/components/storefront/ViewAllLink";
import {
  CATEGORY_SHOWCASE_MOBILE_ORDER,
  CATEGORY_SHOWCASE_ORDER_CLASSES,
  isShopCategorySlug,
} from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type CategoryShowcaseProps = {
  categories: CategoryItem[];
  eyebrow?: string | null;
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

function CategoryNameLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block max-w-full pb-2">
      {children}
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-navy/10"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-px -left-1 h-[2px] w-[calc(100%+0.5rem)] origin-left scale-x-0 rounded-full bg-gradient-to-r from-coral via-coral/85 to-mint shadow-[0_1px_8px_rgba(255,127,110,0.35)] transition-transform duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
        aria-hidden
      />
    </span>
  );
}

export function CategoryShowcase({
  categories,
  eyebrow = "The Collection",
  title = "Shop by category",
  viewAllHref = "/shop",
  viewAllLabel = "View all",
}: CategoryShowcaseProps) {
  if (categories.length === 0) return null;

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  return (
    <section className="relative overflow-hidden border-y border-navy/8 bg-white">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-40 w-72 rounded-full bg-coral/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-36 w-64 rounded-full bg-mint/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-navy/8 pb-3">
          <div className="relative">
            {eyebrow && (
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
                <span
                  className="h-px w-6 bg-gradient-to-r from-transparent via-coral/70 to-coral"
                  aria-hidden
                />
                <span className="animate-heading-shimmer bg-[length:200%_auto] bg-gradient-to-r from-coral via-navy/70 to-mint bg-clip-text text-transparent">
                  {eyebrow}
                </span>
              </p>
            )}
            <h2 className="relative mt-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
              <span className="bg-gradient-to-br from-navy via-navy to-navy/75 bg-clip-text text-transparent">
                {title}
              </span>
              <span
                className="absolute -bottom-2 left-0 h-[2px] w-24 origin-left animate-heading-line-grow rounded-full bg-gradient-to-r from-coral via-coral/85 to-mint shadow-[0_1px_8px_rgba(255,127,110,0.3)]"
                aria-hidden
              />
            </h2>
          </div>
          <ViewAllLink href={viewAllHref} tone="muted" size="xs">
            {viewAllLabel}
          </ViewAllLink>
        </div>

        <nav aria-label="Shop by category" className="mt-1">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
            {CATEGORY_SHOWCASE_MOBILE_ORDER.map((slug, index) => {
              const cat = categoryBySlug.get(slug);
              if (!cat) return null;

              const orderClass = isShopCategorySlug(slug)
                ? CATEGORY_SHOWCASE_ORDER_CLASSES[slug]
                : "";

              return (
              <li
                key={cat.id}
                className={cn(
                  "animate-category-rise border-b border-navy/6",
                  orderClass,
                )}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block px-1 py-2.5 sm:py-3"
                >
                  <CategoryNameLabel>
                    <span className="relative z-10 block text-sm font-medium tracking-tight text-navy transition-[letter-spacing] duration-300 group-hover:tracking-wide">
                      {cat.name}
                    </span>
                  </CategoryNameLabel>
                  {cat.description && (
                    <span className="mt-1.5 block line-clamp-1 pl-0.5 text-xs leading-relaxed text-navy/40 transition-colors duration-300 group-hover:text-navy/60">
                      {cat.description}
                    </span>
                  )}
                </Link>
              </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
