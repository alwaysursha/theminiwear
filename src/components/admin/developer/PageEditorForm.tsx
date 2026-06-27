import type { SitePageData } from "@/lib/cms/types";
import { saveSitePage } from "@/lib/actions/developer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/developer/RichTextEditor";

type PageEditorFormProps = {
  page: SitePageData;
};

export function PageEditorForm({ page }: PageEditorFormProps) {
  const saveAction = saveSitePage.bind(null, page.slug);
  const isContact = page.slug === "contact";

  return (
    <form
      action={saveAction}
      className="max-w-3xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={page.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={page.subtitle ?? ""} />
      </div>

      {!isContact && (
        <div className="space-y-2">
          <Label>Body</Label>
          <RichTextEditor name="body" defaultValue={page.body} />
        </div>
      )}

      {isContact && (
        <>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              defaultValue={page.contactEmail ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={page.contactPhone ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactAddress">Address</Label>
            <textarea
              id="contactAddress"
              name="contactAddress"
              defaultValue={page.contactAddress ?? ""}
              rows={3}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactHours">Hours of operation</Label>
            <textarea
              id="contactHours"
              name="contactHours"
              defaultValue={page.contactHours ?? ""}
              rows={4}
              placeholder={"Mon–Fri: 9am – 5pm PST\nSat–Sun: Closed"}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500">
              One line per row — line breaks appear on the contact page.
            </p>
          </div>
        </>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={page.published}
          className="rounded border-slate-300"
        />
        Published (unpublished pages show “Work in Progress”)
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="showInNav"
          defaultChecked={page.showInNav}
          className="rounded border-slate-300"
        />
        {isContact ? "Show in header navigation" : "Show in footer navigation"}
      </label>

      <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
        Save page
      </Button>
    </form>
  );
}
