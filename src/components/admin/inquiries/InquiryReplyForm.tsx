"use client";

import { useEffect } from "react";
import { Send } from "lucide-react";
import { InquiryStatus } from "@prisma/client";
import { replyToInquiry } from "@/lib/actions/inquiries";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function InquiryReplyForm({ inquiryId }: { inquiryId: string }) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    replyToInquiry,
    initialAdminSaveState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      const form = document.getElementById(`inquiry-reply-${inquiryId}`);
      if (form instanceof HTMLFormElement) {
        form.reset();
      }
    }
  }, [state.ok, pending, inquiryId]);

  return (
    <form
      id={`inquiry-reply-${inquiryId}`}
      action={formAction}
      className="space-y-4"
    >
      <input type="hidden" name="inquiryId" value={inquiryId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="content">Message</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={4}
          placeholder="Type your reply…"
          className="rounded-lg border-slate-200"
          onChange={markDirty}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 sm:w-64">
          <Label htmlFor="status">Update status (optional)</Label>
          <select
            id="status"
            name="status"
            defaultValue=""
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            onChange={markDirty}
          >
            <option value="">Keep current</option>
            {Object.values(InquiryStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <AdminSaveButton
          pending={pending}
          saved={saved}
          label="Send reply"
          savingLabel="Sending reply"
          savedLabel="Reply sent"
          className="rounded-lg"
        />
      </div>
    </form>
  );
}
