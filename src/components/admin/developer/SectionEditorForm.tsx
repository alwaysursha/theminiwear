import type { HomepageSectionKey } from "@prisma/client";
import type { HomepageSectionData } from "@/lib/cms/types";
import { SECTION_RULES } from "@/lib/cms/types";
import { saveHomepageSection } from "@/lib/actions/developer";
import { countSectionProducts } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionEditorFormProps = {
  section: HomepageSectionData;
  productCount?: number;
};

export function SectionEditorForm({
  section,
  productCount,
}: SectionEditorFormProps) {
  const isCategories = section.key === "CATEGORIES";
  const rule =
    section.key !== "CATEGORIES" ? SECTION_RULES[section.key] : null;
  const saveAction = saveHomepageSection.bind(null, section.key as HomepageSectionKey);

  return (
    <form
      action={saveAction}
      className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={section.enabled}
          className="rounded border-slate-300"
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
        <Input id="eyebrow" name="eyebrow" defaultValue={section.eyebrow ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={section.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={section.description ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="viewAllLabel">View all label</Label>
          <Input
            id="viewAllLabel"
            name="viewAllLabel"
            defaultValue={section.viewAllLabel ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="viewAllHref">View all link</Label>
          <Input
            id="viewAllHref"
            name="viewAllHref"
            defaultValue={section.viewAllHref ?? ""}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort by</Label>
              <select
                id="sortBy"
                name="sortBy"
                defaultValue={section.sortBy}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
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
              />
              Include site-wide sale products when filling the section
            </label>
          )}
        </>
      )}

      <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
        Save section
      </Button>
    </form>
  );
}
