import Link from "next/link";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

const categoryOrder = [
  "bodysuits",
  "dresses",
  "tops-tees",
  "bottoms",
  "outerwear",
  "sleepwear",
  "swimwear",
  "accessories",
] as const;

function sortCategories<T extends { slug: string }>(categories: T[]): T[] {
  const rank = new Map(categoryOrder.map((slug, index) => [slug, index]));
  return [...categories].sort(
    (a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99),
  );
}

export function CategoryShowcase({ categories }: { categories: CategoryItem[] }) {
  const sorted = sortCategories(categories);
  if (sorted.length === 0) return null;

  return (
    <section className="border-y border-navy/8 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-navy/8 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
              The Collection
            </p>
            <h2 className="mt-1 font-display text-lg font-medium text-navy sm:text-xl">
              Shop by category
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 border-b border-transparent pb-px text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55 transition-colors hover:border-coral hover:text-coral"
          >
            View all
          </Link>
        </div>

        <nav aria-label="Shop by category" className="mt-1">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((cat) => (
              <li key={cat.id} className="border-b border-navy/6">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group block py-3 pr-3 transition-colors sm:py-3.5"
                >
                  <span className="block text-sm font-medium text-navy transition-colors group-hover:text-coral">
                    {cat.name}
                  </span>
                  {cat.description && (
                    <span className="mt-0.5 block line-clamp-1 text-xs text-navy/45 transition-colors group-hover:text-navy/60">
                      {cat.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
