"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategoryWithProducts,
  updateCategory,
  type CategoryDeleteState,
  type CategorySaveState,
} from "@/lib/actions/developer";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
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

const initialSaveState: CategorySaveState = {};
const initialDeleteState: CategoryDeleteState = {};

function CreateCategoryForm() {
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(
    createCategory,
    initialSaveState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      setShowSaved(true);
    }
  }, [state.ok, pending]);

  useEffect(() => {
    if (state.error) {
      setShowSaved(false);
    }
  }, [state.error]);

  function markDirty() {
    setShowSaved(false);
  }

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="font-semibold text-slate-900">Add category</h3>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-name">Name</Label>
        <Input id="new-name" name="name" required onChange={markDirty} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-slug">Slug</Label>
        <Input
          id="new-slug"
          name="slug"
          placeholder="e.g. sleepwear"
          required
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-description">Description</Label>
        <Input id="new-description" name="description" onChange={markDirty} />
      </div>
      <AdminSaveButton
        pending={pending}
        saved={showSaved && Boolean(state.ok)}
        label="Create category"
        savingLabel="Creating category"
        savedLabel="Category created"
        className="rounded-lg"
      />
    </form>
  );
}

function CategoryRowForm({
  category,
  onDelete,
}: {
  category: CategoryRow;
  onDelete: (category: CategoryRow) => void;
}) {
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateCategory,
    initialSaveState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      setShowSaved(true);
    }
  }, [state.ok, pending]);

  useEffect(() => {
    if (state.error) {
      setShowSaved(false);
    }
  }, [state.error]);

  function markDirty() {
    setShowSaved(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="categoryId" value={category.id} />

        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2"
          >
            {state.error}
          </p>
        )}

        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            name="name"
            defaultValue={category.name}
            onChange={markDirty}
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            name="slug"
            defaultValue={category.slug}
            onChange={markDirty}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Input
            name="description"
            defaultValue={category.description ?? ""}
            onChange={markDirty}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <span className="text-xs text-slate-500">
            {category.productCount} product
            {category.productCount === 1 ? "" : "s"}
          </span>
          <AdminSaveButton
            pending={pending}
            saved={showSaved && Boolean(state.ok)}
            label="Save"
            savingLabel="Saving"
            savedLabel="Saved"
            variant="outline"
            size="sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(category)}
          >
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}

function DeleteCategoryDialog({
  category,
  categories,
  onClose,
}: {
  category: CategoryRow;
  categories: CategoryRow[];
  onClose: () => void;
}) {
  const [state, deleteAction, pending] = useActionState(
    deleteCategoryWithProducts,
    initialDeleteState,
  );
  const moveTargets = useMemo(
    () => categories.filter((entry) => entry.id !== category.id),
    [categories, category.id],
  );
  const [productAction, setProductAction] = useState<"move" | "delete">("move");
  const [targetCategoryId, setTargetCategoryId] = useState(
    () => moveTargets[0]?.id ?? "",
  );

  useEffect(() => {
    if (state.ok && !pending) {
      onClose();
    }
  }, [state.ok, pending, onClose]);

  function submitDelete() {
    const formData = new FormData();
    formData.set("categoryId", category.id);

    if (category.productCount === 0) {
      formData.set("action", "delete");
    } else {
      formData.set("action", productAction);
      if (productAction === "move") {
        formData.set("targetCategoryId", targetCategoryId);
      }
    }

    deleteAction(formData);
  }

  if (category.productCount === 0) {
    return (
      <AdminConfirmDialog
        open
        tone="danger"
        title={`Delete “${category.name}”?`}
        description={
          <>
            This category has no products and will be removed from your shop
            navigation.
            <span className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-900">
              {category.name}
            </span>
            {state.error && (
              <span className="mt-3 block rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {state.error}
              </span>
            )}
          </>
        }
        confirmLabel={pending ? "Deleting..." : "Delete category"}
        cancelLabel="Keep category"
        confirmDisabled={pending}
        onConfirm={submitDelete}
        onCancel={onClose}
      />
    );
  }

  return (
    <AdminConfirmDialog
      open
      tone="danger"
      title={`Delete “${category.name}”?`}
      description={
        <>
          {category.productCount} product
          {category.productCount === 1 ? "" : "s"} are in this category. Move
          them to another category or delete them before removing the category.
          <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="category-delete-action"
                checked={productAction === "move"}
                onChange={() => setProductAction("move")}
              />
              Move products to another category
            </label>
            {productAction === "move" && (
              <select
                value={targetCategoryId}
                onChange={(event) => setTargetCategoryId(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {moveTargets.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="category-delete-action"
                checked={productAction === "delete"}
                onChange={() => setProductAction("delete")}
              />
              Delete all products in this category
            </label>
          </div>
          {state.error && (
            <span className="mt-3 block rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </span>
          )}
        </>
      }
      confirmLabel={pending ? "Deleting..." : "Delete category"}
      cancelLabel="Keep category"
      confirmDisabled={
        pending || (productAction === "move" && moveTargets.length === 0)
      }
      onConfirm={submitDelete}
      onCancel={onClose}
    />
  );
}

export function CategoryManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  return (
    <div className="space-y-8">
      <CreateCategoryForm />

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Existing categories</h3>
        {categories.map((cat) => (
          <CategoryRowForm
            key={cat.id}
            category={cat}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {deleteTarget && (
        <DeleteCategoryDialog
          category={deleteTarget}
          categories={categories}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
