"use client";

import {
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownUp,
  Copy,
  ImageIcon,
  Loader2,
  Package,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteProduct,
  duplicateProduct,
  toggleProductActive,
} from "@/lib/actions/products";
import { formatPrice, cn, shouldBypassImageOptimization } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  categoryId: string | null;
  categoryName: string | null;
  variantCount: number;
  totalStock: number;
  priceDisplay: string;
  minPrice: number;
  hasSale: boolean;
  compareAtMin: number | null;
  isActive: boolean;
  isOnSale: boolean;
  isClearance: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  salePercent: number | null;
  createdAt: string;
};

type SortKey = "newest" | "name" | "price-asc" | "price-desc" | "stock-asc";
type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "in" | "low" | "out";
type PromoFilter = "all" | "sale" | "clearance" | "none";

function stockMeta(total: number) {
  if (total <= 0)
    return { label: "Out of stock", cls: "bg-rose-100 text-rose-700" };
  if (total <= 5)
    return { label: `${total} left`, cls: "bg-amber-100 text-amber-700" };
  return { label: `${total} in stock`, cls: "bg-emerald-100 text-emerald-700" };
}

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400";

export function ProductsManager({
  products,
  categories,
}: {
  products: AdminProductRow[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProductRow | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [promo, setPromo] = useState<PromoFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.slug}`.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.categoryId !== category) return false;
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;
      if (stock === "in" && p.totalStock <= 5) return false;
      if (stock === "low" && !(p.totalStock > 0 && p.totalStock <= 5))
        return false;
      if (stock === "out" && p.totalStock > 0) return false;
      if (promo === "sale" && !p.isOnSale) return false;
      if (promo === "clearance" && !p.isClearance) return false;
      if (promo === "none" && (p.isOnSale || p.isClearance)) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case "stock-asc":
        sorted.sort((a, b) => a.totalStock - b.totalStock);
        break;
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [products, search, category, status, stock, promo, sort]);

  const hasFilters =
    search !== "" ||
    category !== "all" ||
    status !== "all" ||
    stock !== "all" ||
    promo !== "all";

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setStock("all");
    setPromo("all");
    setSort("newest");
  }

  function runAction(
    id: string,
    action: (id: string) => Promise<unknown>,
  ) {
    setBusyId(id);
    startTransition(() => {
      action(id)
        .then(() => router.refresh())
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Something went wrong";
          window.alert(message);
        })
        .finally(() => setBusyId(null));
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or slug…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-nowrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={selectClass}
            >
              <option value="all">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={stock}
              onChange={(e) => setStock(e.target.value as StockFilter)}
              className={selectClass}
            >
              <option value="all">Any stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
            <select
              value={promo}
              onChange={(e) => setPromo(e.target.value as PromoFilter)}
              className={selectClass}
            >
              <option value="all">Any promo</option>
              <option value="sale">On sale</option>
              <option value="clearance">Clearance</option>
              <option value="none">No promo</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {products.length}
          </p>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Clear filters
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="newest">Newest</option>
                <option value="name">Name A–Z</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="stock-asc">Stock: low to high</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No products found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Add your first product to get started."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Variants</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Flags</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const sm = stockMeta(p.totalStock);
                  const busy = busyId === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "group transition-colors hover:bg-slate-50/70",
                        busy && "opacity-50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb src={p.image} alt={p.name} />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="block truncate font-medium text-slate-900 hover:text-slate-600"
                            >
                              {p.name}
                            </Link>
                            <p className="truncate text-xs text-slate-400">
                              {p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {p.categoryName ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {p.variantCount}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                            sm.cls,
                          )}
                        >
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-medium text-slate-900">
                            {p.priceDisplay}
                          </span>
                          {p.hasSale && p.compareAtMin != null && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(p.compareAtMin)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <FlagBadges p={p} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusToggle
                          active={p.isActive}
                          disabled={busy}
                          onClick={() => runAction(p.id, toggleProductActive)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <RowActions
                          product={p}
                          busy={busy}
                          onDuplicate={() => runAction(p.id, duplicateProduct)}
                          onDelete={() => setConfirmDelete(p)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((p) => {
              const sm = stockMeta(p.totalStock);
              const busy = busyId === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-opacity",
                    busy && "opacity-50",
                  )}
                >
                  <div className="flex gap-3">
                    <Thumb src={p.image} alt={p.name} size={64} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="block truncate font-semibold text-slate-900"
                      >
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-slate-400">
                        {p.categoryName ?? "Uncategorized"} · {p.variantCount}{" "}
                        variants
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {p.priceDisplay}
                        </span>
                        {p.hasSale && p.compareAtMin != null && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(p.compareAtMin)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        sm.cls,
                      )}
                    >
                      {sm.label}
                    </span>
                    <FlagBadges p={p} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <StatusToggle
                      active={p.isActive}
                      disabled={busy}
                      onClick={() => runAction(p.id, toggleProductActive)}
                    />
                    <RowActions
                      product={p}
                      busy={busy}
                      onDuplicate={() => runAction(p.id, duplicateProduct)}
                      onDelete={() => setConfirmDelete(p)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {confirmDelete && (
        <DeleteDialog
          product={confirmDelete}
          pending={isPending}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            const target = confirmDelete;
            setConfirmDelete(null);
            runAction(target.id, deleteProduct);
          }}
        />
      )}
    </>
  );
}

function Thumb({
  src,
  alt,
  size = 44,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized={shouldBypassImageOptimization(src)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-300">
          <ImageIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function FlagBadges({ p }: { p: AdminProductRow }) {
  const flags: { label: string; cls: string }[] = [];
  if (p.isOnSale)
    flags.push({
      label: p.salePercent ? `Sale ${p.salePercent}%` : "Sale",
      cls: "bg-rose-100 text-rose-700",
    });
  if (p.isClearance)
    flags.push({ label: "Clearance", cls: "bg-slate-900 text-white" });
  if (p.isNewArrival)
    flags.push({ label: "New", cls: "bg-sky-100 text-sky-700" });
  if (p.isTrending)
    flags.push({ label: "Trending", cls: "bg-violet-100 text-violet-700" });

  if (flags.length === 0) return <span className="text-slate-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <span
          key={f.label}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            f.cls,
          )}
        >
          {f.label}
        </span>
      ))}
    </div>
  );
}

function StatusToggle({
  active,
  disabled,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={active ? "Deactivate" : "Activate"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        active
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400",
        )}
      />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function RowActions({
  product,
  busy,
  onDuplicate,
  onDelete,
}: {
  product: AdminProductRow;
  busy: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors disabled:opacity-50";
  return (
    <div className="flex items-center justify-end gap-1">
      {busy ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin text-slate-400" />
      ) : null}
      <Link
        href={`/admin/products/${product.id}/edit`}
        title="Edit"
        className={cn(btn, "hover:bg-slate-100 hover:text-slate-900")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onDuplicate}
        disabled={busy}
        title="Duplicate"
        className={cn(btn, "hover:bg-slate-100 hover:text-slate-900")}
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        title="Delete"
        className={cn(btn, "hover:bg-rose-50 hover:text-rose-600")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function DeleteDialog({
  product,
  pending,
  onCancel,
  onConfirm,
}: {
  product: AdminProductRow;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div
        className="dash-rise relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{ "--dash-i": 0 } as CSSProperties}
        role="alertdialog"
        aria-modal="true"
      >
        {/* HD alert banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 px-6 pb-5 pt-6 text-white">
          <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/10" />
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 animate-pulse items-center justify-center rounded-full bg-white/20 ring-4 ring-white/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                Danger zone
              </p>
              <h3 className="text-lg font-bold leading-tight">
                Delete this product?
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Thumb src={product.image} alt={product.name} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {product.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {product.variantCount} variant
                {product.variantCount === 1 ? "" : "s"} · {product.priceDisplay}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            This will{" "}
            <span className="font-semibold text-rose-600">permanently</span>{" "}
            remove the product along with all of its variants, images and
            promotions. This action{" "}
            <span className="font-semibold">cannot be undone.</span>
          </p>

          <div className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete permanently
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
