"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  approveProductReview,
  rejectProductReview,
  updateProductReview,
} from "@/lib/actions/reviews";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function ReviewModerationActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const router = useRouter();
  const approveForm = useAdminSaveForm(approveProductReview, initialAdminSaveState);
  const rejectForm = useAdminSaveForm(rejectProductReview, initialAdminSaveState);

  useEffect(() => {
    if ((approveForm.state.ok || rejectForm.state.ok) && !approveForm.pending && !rejectForm.pending) {
      router.refresh();
    }
  }, [
    approveForm.state.ok,
    rejectForm.state.ok,
    approveForm.pending,
    rejectForm.pending,
    router,
  ]);

  if (status !== "PENDING") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form action={approveForm.formAction}>
        <input type="hidden" name="reviewId" value={reviewId} />
        {approveForm.state.error && (
          <p className="mb-2 text-sm text-rose-600">{approveForm.state.error}</p>
        )}
        <AdminSaveButton
          pending={approveForm.pending}
          saved={approveForm.saved}
          label="Approve"
          savingLabel="Approving"
          savedLabel="Approved"
        />
      </form>
      <form action={rejectForm.formAction} className="flex flex-1 flex-wrap items-end gap-3">
        <input type="hidden" name="reviewId" value={reviewId} />
        <div className="min-w-[16rem] flex-1 space-y-2">
          <Label htmlFor="rejectionNote">Rejection note (internal)</Label>
          <Input
            id="rejectionNote"
            name="rejectionNote"
            placeholder="Optional note for admins"
            onChange={rejectForm.markDirty}
          />
        </div>
        {rejectForm.state.error && (
          <p className="w-full text-sm text-rose-600">{rejectForm.state.error}</p>
        )}
        <AdminSaveButton
          pending={rejectForm.pending}
          saved={rejectForm.saved}
          label="Reject"
          savingLabel="Rejecting"
          savedLabel="Rejected"
          variant="destructive"
        />
      </form>
    </div>
  );
}

export function ReviewEditForm({
  reviewId,
  rating,
  title,
  body,
}: {
  reviewId: string;
  rating: number;
  title: string | null;
  body: string;
}) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateProductReview,
    initialAdminSaveState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reviewId" value={reviewId} />
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={rating}
          required
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={title ?? ""}
          onChange={markDirty}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          defaultValue={body}
          required
          onChange={markDirty}
        />
      </div>
      <AdminSaveButton
        pending={pending}
        saved={saved}
        label="Save changes"
        savingLabel="Saving"
        savedLabel="Saved"
        variant="outline"
      />
    </form>
  );
}
