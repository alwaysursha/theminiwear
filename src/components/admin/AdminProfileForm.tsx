"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { updateAdminProfile } from "@/lib/actions/admin-profile";
import { requestPasswordResetForCurrentUser } from "@/lib/actions/password-reset";
import { initialAdminSaveState } from "@/lib/admin-form-state";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSaveForm } from "@/hooks/useAdminSaveForm";

export function AdminProfileForm({
  name,
  email,
  phone,
  hasPassword,
}: {
  name: string;
  email: string;
  phone: string;
  hasPassword: boolean;
}) {
  const { state, formAction, pending, saved, markDirty } = useAdminSaveForm(
    updateAdminProfile,
    initialAdminSaveState,
  );
  const [resetStatus, setResetStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  async function handlePasswordReset() {
    setResetStatus({ type: "loading" });
    const result = await requestPasswordResetForCurrentUser();
    if (result.ok) {
      setResetStatus({ type: "success", message: result.message });
      return;
    }
    setResetStatus({ type: "error", message: result.error });
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="admin-profile-name">Name</Label>
          <Input
            id="admin-profile-name"
            name="name"
            defaultValue={name}
            required
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-profile-email">Email</Label>
          <Input
            id="admin-profile-email"
            value={email}
            disabled
            className="rounded-lg border-slate-200 opacity-70"
          />
          <p className="text-xs text-slate-500">
            Email changes are handled separately. Contact support if you need to
            update your login email.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-profile-phone">Phone</Label>
          <Input
            id="admin-profile-phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            placeholder="Optional"
            className="rounded-lg border-slate-200"
            onChange={markDirty}
          />
        </div>

        <AdminSaveButton
          pending={pending}
          saved={saved}
          label="Save profile"
          savingLabel="Saving profile"
          savedLabel="Profile saved"
          className="rounded-lg"
        />
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">Password</h3>
            {hasPassword ? (
              <p className="mt-1 text-sm text-slate-600">
                Send a secure reset link to <strong>{email}</strong>. The link
                expires in 1 hour.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                This account uses Google sign-in and does not have a password.
              </p>
            )}

            {resetStatus.type === "success" && resetStatus.message && (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {resetStatus.message}
              </p>
            )}
            {resetStatus.type === "error" && resetStatus.message && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {resetStatus.message}
              </p>
            )}

            {hasPassword && (
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetStatus.type === "loading"}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {resetStatus.type === "loading"
                  ? "Sending reset link..."
                  : "Email me a password reset link"}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Signed out elsewhere? You can also use{" "}
        <Link href="/auth/forgot-password" className="font-semibold text-slate-700 underline">
          forgot password
        </Link>{" "}
        on the sign-in page.
      </p>
    </div>
  );
}
