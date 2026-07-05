"use client";

import { InquiryStatus } from "@prisma/client";
import { UserRound } from "lucide-react";
import { assignInquiry, updateInquiryStatus } from "@/lib/actions/inquiries";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function InquiryAdminControls({
  inquiryId,
  status,
  assigneeId,
  staff,
}: {
  inquiryId: string;
  status: InquiryStatus;
  assigneeId: string | null;
  staff: { id: string; name: string | null; email: string }[];
}) {
  const statusForm = useAdminSaveForm(updateInquiryStatus, initialAdminSaveState);
  const assignForm = useAdminSaveForm(assignInquiry, initialAdminSaveState);

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
      <form action={statusForm.formAction} className="space-y-3">
        <input type="hidden" name="inquiryId" value={inquiryId} />
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <UserRound className="h-4 w-4 text-slate-400" />
          Status
        </h3>
        {statusForm.state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {statusForm.state.error}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="inquiry-status">Update status</Label>
          <select
            id="inquiry-status"
            name="status"
            defaultValue={status}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            onChange={statusForm.markDirty}
          >
            {Object.values(InquiryStatus).map((value) => (
              <option key={value} value={value}>
                {value.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <AdminSaveButton
          pending={statusForm.pending}
          saved={statusForm.saved}
          label="Save status"
          savingLabel="Saving status"
          savedLabel="Status saved"
          variant="outline"
          className="rounded-lg border-slate-200"
        />
      </form>

      <form action={assignForm.formAction} className="space-y-3">
        <input type="hidden" name="inquiryId" value={inquiryId} />
        <h3 className="font-semibold text-slate-900">Assignment</h3>
        {assignForm.state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {assignForm.state.error}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="assigneeId">Assign to</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={assigneeId ?? ""}
            required
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            onChange={assignForm.markDirty}
          >
            <option value="" disabled>
              Select team member
            </option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </select>
        </div>
        <AdminSaveButton
          pending={assignForm.pending}
          saved={assignForm.saved}
          label="Assign inquiry"
          savingLabel="Assigning"
          savedLabel="Assigned"
          variant="outline"
          className="rounded-lg border-slate-200"
        />
      </form>
    </div>
  );
}
