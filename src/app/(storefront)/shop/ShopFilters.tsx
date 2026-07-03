"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, type ReactNode } from "react";
import { Search, Sparkles, Tag, Flame, RotateCcw } from "lucide-react";
import { AGE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Gender } from "@prisma/client";
import type { SiteSaleSettings } from "@/lib/settings";

const genders: { value: Gender | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" },
  { value: "UNISEX", label: "Unisex" },
];

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy/45">
      {children}
    </p>
  );
}

export function ShopFilters({
  categories,
  siteSale,
  className,
}: {
  categories: Category[];
  siteSale?: SiteSaleSettings;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    gender: searchParams.get("gender") ?? "",
    ageGroup: searchParams.get("ageGroup") ?? "",
    isNew: searchParams.get("new") === "true",
    isSale: searchParams.get("sale") === "true",
    isClearance: searchParams.get("clearance") === "true",
  };

  const [searchDraft, setSearchDraft] = useState(current.search);

  const hasActive =
    !!current.search ||
    !!current.category ||
    !!current.gender ||
    !!current.ageGroup ||
    current.isNew ||
    current.isSale ||
    current.isClearance;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      startTransition(() => router.push(qs ? `/shop?${qs}` : "/shop"));
    },
    [router, searchParams],
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParams({ search: searchDraft.trim() || null });
  }

  const pill =
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ring-1 ring-inset";

  return (
    <div
      className={cn("space-y-7", className)}
      aria-busy={isPending}
      data-pending={isPending ? "" : undefined}
    >
      {/* Quick toggles */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams({ new: current.isNew ? null : "true" })}
          className={cn(
            pill,
            "inline-flex items-center gap-1.5",
            current.isNew
              ? "bg-mint text-navy ring-mint"
              : "bg-white text-navy/65 ring-navy/12 hover:ring-navy/25",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          New
        </button>
        <button
          type="button"
          onClick={() => updateParams({ sale: current.isSale ? null : "true" })}
          className={cn(
            pill,
            "inline-flex items-center gap-1.5",
            current.isSale
              ? "bg-coral text-white ring-coral"
              : "bg-white text-navy/65 ring-navy/12 hover:ring-navy/25",
          )}
        >
          <Tag className="h-3.5 w-3.5" />
          {siteSale?.enabled ? `Sale ${siteSale.percent}%` : "On Sale"}
        </button>
        <button
          type="button"
          onClick={() =>
            updateParams({ clearance: current.isClearance ? null : "true" })
          }
          className={cn(
            pill,
            "inline-flex items-center gap-1.5",
            current.isClearance
              ? "bg-navy text-white ring-navy"
              : "bg-white text-navy/65 ring-navy/12 hover:ring-navy/25",
          )}
        >
          <Flame className="h-3.5 w-3.5" />
          Clearance
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <FilterLabel>Search</FilterLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            name="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-navy/12 bg-white pl-10 pr-3 text-sm text-navy shadow-sm outline-none transition-colors placeholder:text-navy/35 focus:border-coral/50 focus:ring-2 focus:ring-coral/20"
          />
        </div>
      </form>

      {/* Categories */}
      <div>
        <FilterLabel>Collections</FilterLabel>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => updateParams({ category: null })}
            className={cn(
              "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
              current.category === ""
                ? "bg-coral/10 text-coral"
                : "text-navy/70 hover:bg-blush/40",
            )}
          >
            All collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParams({ category: cat.slug })}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                current.category === cat.slug
                  ? "bg-coral/10 text-coral"
                  : "text-navy/70 hover:bg-blush/40",
              )}
            >
              {cat.name}
              {current.category === cat.slug && (
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gender segmented control */}
      <div>
        <FilterLabel>Gender</FilterLabel>
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-navy/[0.05] p-1">
          {genders.map((g) => (
            <button
              key={g.value || "all"}
              type="button"
              onClick={() => updateParams({ gender: g.value || null })}
              className={cn(
                "rounded-xl py-2 text-xs font-semibold transition-all duration-200",
                current.gender === g.value
                  ? "bg-white text-navy shadow-sm ring-1 ring-navy/10"
                  : "text-navy/55 hover:text-navy",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age chips */}
      <div>
        <FilterLabel>Age</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => updateParams({ ageGroup: null })}
            className={cn(
              pill,
              current.ageGroup === ""
                ? "bg-navy text-white ring-navy"
                : "bg-white text-navy/60 ring-navy/12 hover:ring-navy/25",
            )}
          >
            All
          </button>
          {AGE_GROUPS.map((age) => (
            <button
              key={age}
              type="button"
              onClick={() => updateParams({ ageGroup: age })}
              className={cn(
                pill,
                current.ageGroup === age
                  ? "bg-navy text-white ring-navy"
                  : "bg-white text-navy/60 ring-navy/12 hover:ring-navy/25",
              )}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={() => {
            setSearchDraft("");
            startTransition(() => router.push("/shop"));
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/55 transition-colors hover:text-coral"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
