"use client";

import { useActionState, useEffect, useState } from "react";
import type { SitePageData } from "@/lib/cms/types";
import {
  saveSitePage,
  type PageSaveState,
} from "@/lib/actions/developer";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/developer/RichTextEditor";

type PageEditorFormProps = {
  page: SitePageData;
};

const initialSaveState: PageSaveState = {};

export function PageEditorForm({ page }: PageEditorFormProps) {
  const isContact = page.slug === "contact";
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveSitePage,
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
      className="max-w-3xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="pageSlug" value={page.slug} />

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={page.title}
          required
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={page.subtitle ?? ""}
          onChange={markDirty}
        />
      </div>

      {!isContact && (
        <div className="space-y-2">
          <Label>Body</Label>
          <RichTextEditor
            name="body"
            defaultValue={page.body}
            onChange={markDirty}
          />
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
              onChange={markDirty}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={page.contactPhone ?? ""}
              onChange={markDirty}
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
              onChange={markDirty}
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
              onChange={markDirty}
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
          onChange={markDirty}
        />
        Published (unpublished pages show “Work in Progress”)
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="showInNav"
          defaultChecked={page.showInNav}
          className="rounded border-slate-300"
          onChange={markDirty}
        />
        {isContact ? "Show in header navigation" : "Show in footer navigation"}
      </label>

      <AdminSaveButton
        pending={pending}
        saved={showSaved && Boolean(state.ok)}
        label="Save page"
        savingLabel="Saving page"
        savedLabel="Page saved"
        className="rounded-lg"
      />
    </form>
  );
}
