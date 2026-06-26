"use client";

import { useState } from "react";
import { Gender } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGE_GROUPS, COLORS, SIZES } from "@/lib/constants";
import type {
  ProductImageInput,
  ProductVariantInput,
} from "@/lib/actions/products";

type Category = { id: string; name: string };

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

const emptyVariant = (): ProductVariantInput => ({
  size: SIZES[0],
  color: COLORS[0],
  ageGroup: AGE_GROUPS[0],
  sku: "",
  price: "",
  salePrice: "",
  stock: "0",
});

const emptyImage = (): ProductImageInput => ({
  url: "",
  alt: "",
  sortOrder: "0",
});

export function ProductForm({
  action,
  categories,
  initialData,
  submitLabel = "Save product",
}: ProductFormProps) {
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initialData?.variants.length ? initialData.variants : [emptyVariant()],
  );
  const [images, setImages] = useState<ProductImageInput[]>(
    initialData?.images.length ? initialData.images : [emptyImage()],
  );

  return (
    <form
      action={action}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            className="rounded-md border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialData?.categoryId ?? ""}
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
            defaultValue={initialData?.gender ?? Gender.UNISEX}
            className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            {Object.values(Gender).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
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

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Images</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md border-slate-200"
            onClick={() => setImages([...images, emptyImage()])}
          >
            <Plus className="h-4 w-4" />
            Add image
          </Button>
        </div>
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={image.id ?? `img-${index}`}
              className="grid gap-3 rounded-md border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => {
                  const next = [...images];
                  next[index] = { ...next[index], url: e.target.value };
                  setImages(next);
                }}
                className="rounded-md border-slate-200"
              />
              <Input
                placeholder="Alt text"
                value={image.alt ?? ""}
                onChange={(e) => {
                  const next = [...images];
                  next[index] = { ...next[index], alt: e.target.value };
                  setImages(next);
                }}
                className="rounded-md border-slate-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                disabled={images.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Variants</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md border-slate-200"
            onClick={() => setVariants([...variants, emptyVariant()])}
          >
            <Plus className="h-4 w-4" />
            Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `var-${index}`}
              className="grid gap-3 rounded-md border border-slate-100 bg-slate-50 p-4 md:grid-cols-7"
            >
              <select
                value={variant.size}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], size: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={variant.color}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], color: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={variant.ageGroup}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], ageGroup: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
              >
                {AGE_GROUPS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <Input
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], sku: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border-slate-200"
              />
              <Input
                placeholder="Regular price"
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], price: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border-slate-200"
              />
              <Input
                placeholder="Sale price"
                type="number"
                step="0.01"
                value={variant.salePrice ?? ""}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...next[index], salePrice: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border-slate-200"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Stock"
                  type="number"
                  value={variant.stock}
                  onChange={(e) => {
                    const next = [...variants];
                    next[index] = { ...next[index], stock: e.target.value };
                    setVariants(next);
                  }}
                  className="rounded-md border-slate-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-red-500 hover:text-red-600"
                  onClick={() =>
                    setVariants(variants.filter((_, i) => i !== index))
                  }
                  disabled={variants.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
