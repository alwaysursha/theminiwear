import { InquiryStatus } from "@prisma/client";
import { UserRound } from "lucide-react";
import { assignInquiry, updateInquiryStatus } from "@/lib/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const boundAssign = assignInquiry.bind(null, inquiryId);
  const boundStatus = updateInquiryStatus.bind(null, inquiryId);

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
      <form action={boundStatus} className="space-y-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <UserRound className="h-4 w-4 text-slate-400" />
          Status
        </h3>
        <div className="space-y-2">
          <Label htmlFor="inquiry-status">Update status</Label>
          <select
            id="inquiry-status"
            name="status"
            defaultValue={status}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {Object.values(InquiryStatus).map((value) => (
              <option key={value} value={value}>
                {value.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="rounded-lg border-slate-200"
        >
          Save status
        </Button>
      </form>

      <form action={boundAssign} className="space-y-3">
        <h3 className="font-semibold text-slate-900">Assignment</h3>
        <div className="space-y-2">
          <Label htmlFor="assigneeId">Assign to</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={assigneeId ?? ""}
            required
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
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
        <Button
          type="submit"
          variant="outline"
          className="rounded-lg border-slate-200"
        >
          Assign inquiry
        </Button>
      </form>
    </div>
  );
}
