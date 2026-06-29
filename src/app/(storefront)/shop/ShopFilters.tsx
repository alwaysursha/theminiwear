"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGE_GROUPS } from "@/lib/constants";
import type { Category, Gender } from "@prisma/client";
import type { SiteSaleSettings } from "@/lib/settings";

const genders: { value: Gender; label: string }[] = [
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" },
  { value: "UNISEX", label: "Unisex" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

export function ShopFilters({
  categories,
  siteSale,
}: {
  categories: Category[];
  siteSale?: SiteSaleSettings;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`/shop?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateParams({
      search: (formData.get("search") as string) || null,
      category: (formData.get("category") as string) || null,
      gender: (formData.get("gender") as string) || null,
      ageGroup: (formData.get("ageGroup") as string) || null,
      sort: (formData.get("sort") as string) || null,
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/shop");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap gap-2">
        <Link
          href="/shop?sale=true"
          className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-navy hover:bg-blush/80"
        >
          {siteSale?.enabled ? `Sale ${siteSale.percent}% off` : "On Sale"}
        </Link>
        <Link
          href="/shop?clearance=true"
          className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white hover:bg-navy/90"
        >
          Clearance
        </Link>
      </div>

      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search products..."
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="category">Shop by category</Label>
        <select
          id="category"
          name="category"
          defaultValue={searchParams.get("category") ?? ""}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-navy/15 bg-white px-4 text-sm text-navy"
        >
          <option value="">All collections</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          name="gender"
          defaultValue={searchParams.get("gender") ?? ""}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-navy/15 bg-white px-4 text-sm text-navy"
        >
          <option value="">All</option>
          {genders.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="ageGroup">Age Group</Label>
        <select
          id="ageGroup"
          name="ageGroup"
          defaultValue={searchParams.get("ageGroup") ?? ""}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-navy/15 bg-white px-4 text-sm text-navy"
        >
          <option value="">All ages</option>
          {AGE_GROUPS.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="sort">Sort by</Label>
        <select
          id="sort"
          name="sort"
          defaultValue={searchParams.get("sort") ?? "newest"}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-navy/15 bg-white px-4 text-sm text-navy"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Filtering..." : "Apply"}
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </form>
  );
}
