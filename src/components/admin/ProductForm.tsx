"use client";

import { useMemo, useState } from "react";
import { Gender } from "@prisma/client";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { COLORS, SIZES } from "@/lib/constants";
import {
  ageGroupForSize,
  getShopCategoryGenders,
  getShopCategorySizes,
} from "@/lib/shop-categories";
import type {
  ProductImageInput,
  ProductVariantInput,
} from "@/lib/actions/products";

type Category = { id: string; name: string; slug: string };

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  initialData?: {
    name: string;
    description: string;
    gender: Gender;
    occasion: string | null;
    categoryId: string | null;
    isNewArrival: boolean;
    isTrending: boolean;
    isOnSale: boolean;
    isClearance: boolean;
    salePercent: number | null;
    saleEndsAt: Date | null;
    isActive: boolean;
    variants: ProductVariantInput[];
    images: ProductImageInput[];
  };
  submitLabel?: string;
}

const GENDER_LABEL: Record<Gender, string> = {
  UNISEX: "Unisex",
  GIRLS: "Girls",
  BOYS: "Boys",
};

function skuFor(name: string, color: string, size: string) {
  const norm = (v: string) =>
    v
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const base = norm(name) || "item";
  return `${base}-${norm(color)}-${norm(size)}`.replace(/-+/g, "-");
}

function uniquePreserveOrder(values: string[]) {
  return [...new Set(values)];
}

export function ProductForm({
  action,
  categories,
  initialData,
  submitLabel = "Save product",
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [gender, setGender] = useState<Gender>(
    initialData?.gender ?? Gender.UNISEX,
  );

  const initVariants = useMemo(
    () => initialData?.variants ?? [],
    [initialData?.variants],
  );
  const [colors, setColors] = useState<string[]>(
    uniquePreserveOrder(initVariants.map((v) => v.color)),
  );
  const [sizes, setSizes] = useState<string[]>(
    uniquePreserveOrder(initVariants.map((v) => v.size)),
  );

  const [basePrice, setBasePrice] = useState(initVariants[0]?.price ?? "");
  const [baseSalePrice, setBaseSalePrice] = useState(
    initVariants[0]?.salePrice ?? "",
  );

  const [sizePriceOverride, setSizePriceOverride] = useState<
    Record<string, string>
  >(() => {
    const overrides: Record<string, string> = {};
    const base = initVariants[0]?.price ?? "";
    for (const v of initVariants) {
      if (v.price && v.price !== base && !overrides[v.size]) {
        overrides[v.size] = v.price;
      }
    }
    return overrides;
  });

  const [stock, setStock] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const v of initVariants) {
      map[`${v.color}__${v.size}`] = v.stock;
    }
    return map;
  });

  const [customColor, setCustomColor] = useState("");
  const [images, setImages] = useState<ProductImageInput[]>(
    initialData?.images ?? [],
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Preserve ids/SKUs for existing color+size combos on update.
  const existingVariantMap = useMemo(() => {
    const map = new Map<string, ProductVariantInput>();
    for (const v of initVariants) map.set(`${v.color}__${v.size}`, v);
    return map;
  }, [initVariants]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const categorySlug = selectedCategory?.slug ?? null;
  const allowedGenders = getShopCategoryGenders(categorySlug);
  const availableSizes = categorySlug
    ? getShopCategorySizes(categorySlug)
    : [...SIZES];

  function handleCategoryChange(nextId: string) {
    setCategoryId(nextId);
    const nextCategory = categories.find((c) => c.id === nextId);
    const nextGenders = getShopCategoryGenders(nextCategory?.slug ?? null);
    if (!nextGenders.includes(gender)) {
      setGender(nextGenders[0] ?? Gender.UNISEX);
    }
    const nextSizes = nextCategory?.slug
      ? getShopCategorySizes(nextCategory.slug)
      : [...SIZES];
    setSizes((prev) => prev.filter((s) => nextSizes.includes(s)));
  }

  function toggleColor(color: string) {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  function addCustomColor() {
    const value = customColor.trim();
    if (value && !colors.includes(value)) {
      setColors((prev) => [...prev, value]);
    }
    setCustomColor("");
  }

  function removeColor(color: string) {
    setColors((prev) => prev.filter((c) => c !== color));
    setImages((prev) =>
      prev.map((img) => (img.color === color ? { ...img, color: "" } : img)),
    );
  }

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  const variants: ProductVariantInput[] = useMemo(() => {
    const rows: ProductVariantInput[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color}__${size}`;
        const existing = existingVariantMap.get(key);
        const price = sizePriceOverride[size]?.trim() || basePrice;
        rows.push({
          id: existing?.id,
          size,
          color,
          ageGroup: ageGroupForSize(size),
          sku: existing?.sku || skuFor(name, color, size),
          price,
          salePrice: baseSalePrice,
          stock: stock[key] ?? "0",
        });
      }
    }
    return rows;
  }, [
    colors,
    sizes,
    existingVariantMap,
    sizePriceOverride,
    basePrice,
    baseSalePrice,
    stock,
    name,
  ]);

  const paletteColors = uniquePreserveOrder([...COLORS, ...colors]);

  async function handleSubmit(formData: FormData) {
    if (colors.length === 0 || sizes.length === 0) {
      setFormError(
        "Add at least one color and one size — variants (and the price shoppers see) are built from color × size.",
      );
      return;
    }
    if (!basePrice.trim() || Number(basePrice) <= 0) {
      setFormError("Enter a base price greater than 0.");
      return;
    }
    setFormError(null);
    await action(formData);
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {/* Basics */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={initialData?.description}
          className="rounded-md border-slate-200"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            {allowedGenders.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </select>
          {categorySlug && (
            <p className="text-xs text-slate-400">
              Limited by category. Unisex also appears in the paired category.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion</Label>
          <Input
            id="occasion"
            name="occasion"
            defaultValue={initialData?.occasion ?? ""}
            className="rounded-md border-slate-200"
          />
        </div>
        <div className="flex flex-col justify-end gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isNewArrival"
              defaultChecked={initialData?.isNewArrival}
              className="rounded border-slate-300"
            />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isTrending"
              defaultChecked={initialData?.isTrending}
              className="rounded border-slate-300"
            />
            Trending
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initialData?.isActive ?? true}
              className="rounded border-slate-300"
            />
            Active
          </label>
        </div>
      </div>

      {/* Sale & clearance */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Sale &amp; clearance</h3>
        <p className="mt-1 text-xs text-slate-500">
          Mark items on sale individually, or use Settings for a site-wide sale.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isOnSale"
              defaultChecked={initialData?.isOnSale}
              className="rounded border-slate-300"
            />
            On sale
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isClearance"
              defaultChecked={initialData?.isClearance}
              className="rounded border-slate-300"
            />
            Clearance
          </label>
          <div className="space-y-2">
            <Label htmlFor="salePercent">Sale % off</Label>
            <Input
              id="salePercent"
              name="salePercent"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 20"
              defaultValue={initialData?.salePercent ?? ""}
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saleEndsAt">Sale ends</Label>
            <Input
              id="saleEndsAt"
              name="saleEndsAt"
              type="date"
              defaultValue={
                initialData?.saleEndsAt
                  ? initialData.saleEndsAt.toISOString().slice(0, 10)
                  : ""
              }
              className="rounded-md border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Images</h3>
        <p className="mb-3 mt-1 text-xs text-slate-500">
          First image is the cover. Link an image to a color so it shows when
          shoppers pick that color.
        </p>
        <ProductImageUploader
          images={images}
          onChange={setImages}
          colors={colors}
        />
      </div>

      {/* Variants */}
      <div className="space-y-6 rounded-md border border-slate-200 bg-slate-50/60 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Variants</h3>
          <p className="mt-1 text-xs text-slate-500">
            Pick colors and sizes — a variant is created for every combination.
            Age group is set automatically from the category.
          </p>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <Label>Colors</Label>
          <div className="flex flex-wrap gap-2">
            {paletteColors.map((color) => {
              const active = colors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {color}
                  {active && (
                    <X
                      className="h-3 w-3 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColor(color);
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomColor();
                }
              }}
              placeholder="Add a custom color"
              className="max-w-xs rounded-md border-slate-200"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-md border-slate-200"
              onClick={addCustomColor}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <Label>Sizes</Label>
          {categorySlug ? (
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const active = sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Select a category above to choose sizes.
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base price</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g. 29.99"
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseSalePrice">Sale price (optional)</Label>
            <Input
              id="baseSalePrice"
              type="number"
              step="0.01"
              min={0}
              value={baseSalePrice ?? ""}
              onChange={(e) => setBaseSalePrice(e.target.value)}
              placeholder="Applied to all sizes"
              className="rounded-md border-slate-200"
            />
          </div>
        </div>

        {/* Inventory matrix */}
        {colors.length > 0 && sizes.length > 0 ? (
          <div className="space-y-2">
            <Label>Inventory &amp; stock</Label>
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Color \ Size
                    </th>
                    {sizes.map((size) => (
                      <th key={size} className="px-3 py-2 text-center">
                        <div className="text-xs font-bold text-slate-700">
                          {size}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={sizePriceOverride[size] ?? ""}
                          onChange={(e) =>
                            setSizePriceOverride((prev) => ({
                              ...prev,
                              [size]: e.target.value,
                            }))
                          }
                          placeholder="price"
                          className="mt-1 w-20 rounded border border-slate-200 px-1.5 py-1 text-center text-[11px] text-slate-500"
                          title={`Optional price override for ${size}`}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color) => (
                    <tr key={color} className="border-t border-slate-100">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                        {color}
                      </td>
                      {sizes.map((size) => {
                        const key = `${color}__${size}`;
                        return (
                          <td key={size} className="px-2 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={stock[key] ?? ""}
                              onChange={(e) =>
                                setStock((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder="0"
                              className="w-16 rounded border border-slate-200 px-2 py-1.5 text-center text-sm"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400">
              {variants.length} variant{variants.length === 1 ? "" : "s"} will be
              saved. Age group auto-set from size. SKUs auto-generated.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Add at least one color and one size to build the variant grid.
          </p>
        )}
      </div>

      {formError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
