"use client";

import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ShopFilters } from "@/app/(storefront)/shop/ShopFilters";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";
import type { SiteSaleSettings } from "@/lib/settings";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

const genderLabels: Record<string, string> = {
  BOYS: "Boys",
  GIRLS: "Girls",
  UNISEX: "Unisex",
};

function prettifySlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ShopControls({
  total,
  categories,
  siteSale,
}: {
  total: number;
  categories: Category[];
  siteSale?: SiteSaleSettings;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sort = searchParams.get("sort") ?? "newest";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `/shop?${qs}` : "/shop");
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const scrollY = window.scrollY;
    const original = document.body.style.cssText;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.cssText = original;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const category = searchParams.get("category");
  const gender = searchParams.get("gender");
  const ageGroup = searchParams.get("ageGroup");
  const search = searchParams.get("search");
  const isNew = searchParams.get("new") === "true";
  const isSale = searchParams.get("sale") === "true";
  const isClearance = searchParams.get("clearance") === "true";

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (search)
    chips.push({ key: "search", label: `“${search}”`, clear: () => updateParams({ search: null }) });
  if (category) {
    const name =
      categories.find((c) => c.slug === category)?.name ?? prettifySlug(category);
    chips.push({ key: "category", label: name, clear: () => updateParams({ category: null }) });
  }
  if (gender)
    chips.push({ key: "gender", label: genderLabels[gender] ?? gender, clear: () => updateParams({ gender: null }) });
  if (ageGroup)
    chips.push({ key: "age", label: ageGroup, clear: () => updateParams({ ageGroup: null }) });
  if (isNew)
    chips.push({ key: "new", label: "New", clear: () => updateParams({ new: null }) });
  if (isSale)
    chips.push({ key: "sale", label: "On Sale", clear: () => updateParams({ sale: null }) });
  if (isClearance)
    chips.push({ key: "clearance", label: "Clearance", clear: () => updateParams({ clearance: null }) });

  const activeCount = chips.length;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-navy/55">
          <span className="font-display font-extrabold text-navy">{total}</span>{" "}
          {total === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy/45" />
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
              className="h-10 cursor-pointer appearance-none rounded-full border border-navy/12 bg-white pl-8 pr-9 text-xs font-semibold text-navy shadow-sm outline-none transition-colors hover:border-navy/25 focus:border-coral/50 focus:ring-2 focus:ring-coral/20"
              aria-label="Sort products"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" />
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-navy/12 bg-white px-4 text-xs font-semibold text-navy shadow-sm transition-colors hover:border-navy/25 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="group inline-flex items-center gap-1.5 rounded-full bg-navy/[0.06] py-1.5 pl-3 pr-2 text-xs font-semibold text-navy transition-colors hover:bg-coral/12 hover:text-coral"
            >
              {chip.label}
              <X className="h-3.5 w-3.5 text-navy/40 transition-colors group-hover:text-coral" />
            </button>
          ))}
        </div>
      )}

      {drawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[120] lg:hidden">
            <div
              className="shop-drawer-backdrop absolute inset-0 bg-navy/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <div className="shop-drawer-panel absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
                <h2 className="font-display text-lg font-extrabold text-navy">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-navy/60 transition-colors hover:bg-blush/60 hover:text-navy"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ShopFilters categories={categories} siteSale={siteSale} />
              </div>
              <div className="border-t border-navy/10 p-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full rounded-full bg-coral py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(255,127,110,0.32)] transition-transform active:scale-[0.98]"
                >
                  View {total} {total === 1 ? "result" : "results"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
