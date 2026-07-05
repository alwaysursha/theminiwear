"use client";

import { useEffect } from "react";
import { addCustomerNote } from "@/lib/actions/customers";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function CustomerNoteForm({ customerId }: { customerId: string }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    addCustomerNote,
    initialAdminSaveState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      const form = document.getElementById(`customer-note-${customerId}`);
      if (form instanceof HTMLFormElement) {
        form.reset();
      }
    }
  }, [state.ok, pending, customerId]);

  return (
    <form
      id={`customer-note-${customerId}`}
      action={formAction}
      className="space-y-4 border-t border-slate-100 pt-5"
    >
      <input type="hidden" name="customerId" value={customerId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="content">Add note</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={3}
          placeholder="Internal note about this customer…"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="vip, returns, wholesale"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <AdminSaveButton
        pending={pending}
        saved={saved}
        label="Save note"
        savingLabel="Saving note"
        savedLabel="Note saved"
        className="rounded-lg"
      />
    </form>
  );
}
