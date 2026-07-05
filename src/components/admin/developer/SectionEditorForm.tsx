"use client";

import { useActionState, useEffect, useState } from "react";
import type { HomepageSectionData } from "@/lib/cms/types";
import { SECTION_RULES } from "@/lib/cms/types";
import {
  saveHomepageSection,
  type SectionSaveState,
} from "@/lib/actions/developer";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionEditorFormProps = {
  section: HomepageSectionData;
  productCount?: number;
};

const initialSaveState: SectionSaveState = {};

export function SectionEditorForm({
  section,
  productCount,
}: SectionEditorFormProps) {
  const isCategories = section.key === "CATEGORIES";
  const rule =
    section.key !== "CATEGORIES" ? SECTION_RULES[section.key] : null;
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveHomepageSection,
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
      className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="sectionKey" value={section.key} />

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={section.enabled}
          className="rounded border-slate-300"
          onChange={markDirty}
        />
        Show this section on the homepage
      </label>

      {rule && (
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Automatic product rules</p>
          <p className="mt-1">{rule}</p>
          {productCount !== undefined && (
            <p className="mt-2 text-xs text-slate-500">
              Currently matching {productCount} active product
              {productCount === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="eyebrow">Eyebrow (optional)</Label>
        <Input
          id="eyebrow"
          name="eyebrow"
          defaultValue={section.eyebrow ?? ""}
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={section.title}
          required
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={section.description ?? ""}
          onChange={markDirty}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="viewAllLabel">View all label</Label>
          <Input
            id="viewAllLabel"
            name="viewAllLabel"
            defaultValue={section.viewAllLabel ?? ""}
            onChange={markDirty}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="viewAllHref">View all link</Label>
          <Input
            id="viewAllHref"
            name="viewAllHref"
            defaultValue={section.viewAllHref ?? ""}
            onChange={markDirty}
          />
        </div>
      </div>

      {!isCategories && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productLimit">Products to show</Label>
              <Input
                id="productLimit"
                name="productLimit"
                type="number"
                min={1}
                max={12}
                defaultValue={section.productLimit}
                onChange={markDirty}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort by</Label>
              <select
                id="sortBy"
                name="sortBy"
                defaultValue={section.sortBy}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                onChange={markDirty}
              >
                <option value="NEWEST">Newest</option>
                <option value="TRENDING_SCORE">Trending score</option>
                <option value="UPDATED">Recently updated</option>
                <option value="NAME">Name A–Z</option>
              </select>
            </div>
          </div>

          {section.key === "ON_SALE" && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="includeSiteWideSale"
                defaultChecked={section.includeSiteWideSale}
                className="rounded border-slate-300"
                onChange={markDirty}
              />
              Include site-wide sale products when filling the section
            </label>
          )}
        </>
      )}

      <AdminSaveButton
        pending={pending}
        saved={showSaved && Boolean(state.ok)}
        label="Save section"
        savingLabel="Saving section"
        savedLabel="Section saved"
        className="rounded-lg"
      />
    </form>
  );
}
