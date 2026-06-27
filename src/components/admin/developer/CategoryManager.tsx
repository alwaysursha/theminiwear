"use client";

import { useState } from "react";
import { deleteCategoryWithProducts, updateCategory } from "@/lib/actions/developer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
};

type CategoryManagerProps = {
  categories: CategoryRow[];
  createCategory: (formData: FormData) => Promise<void>;
};

export function CategoryManager({
  categories,
  createCategory,
}: CategoryManagerProps) {
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  return (
    <div className="space-y-8">
      <form
        action={createCategory}
        className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="font-semibold text-slate-900">Add category</h3>
        <div className="space-y-2">
          <Label htmlFor="new-name">Name</Label>
          <Input id="new-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-slug">Slug</Label>
          <Input id="new-slug" name="slug" placeholder="e.g. sleepwear" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-description">Description</Label>
          <Input id="new-description" name="description" />
        </div>
        <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
          Create category
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Existing categories</h3>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <form action={updateCategory.bind(null, cat.id)} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={cat.name} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input name="slug" defaultValue={cat.slug} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input name="description" defaultValue={cat.description ?? ""} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <span className="text-xs text-slate-500">
                  {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                </span>
                <Button type="submit" variant="outline" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setDeleteTarget(cat)}
                >
                  Delete
                </Button>
              </div>
            </form>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete “{deleteTarget.name}”?
            </h3>
            {deleteTarget.productCount === 0 ? (
              <form action={deleteCategoryWithProducts} className="mt-4 space-y-4">
                <input type="hidden" name="categoryId" value={deleteTarget.id} />
                <input type="hidden" name="action" value="delete" />
                <p className="text-sm text-slate-600">This category has no products.</p>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                    Delete category
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <form action={deleteCategoryWithProducts} className="mt-4 space-y-4">
                <input type="hidden" name="categoryId" value={deleteTarget.id} />
                <p className="text-sm text-slate-600">
                  {deleteTarget.productCount} product(s) are in this category. Move them or
                  delete them first.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="action" value="move" defaultChecked />
                    Move products to another category
                  </label>
                  <select
                    name="targetCategoryId"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories
                      .filter((c) => c.id !== deleteTarget.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="action" value="delete" />
                    Delete all products in this category
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                    Confirm
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
