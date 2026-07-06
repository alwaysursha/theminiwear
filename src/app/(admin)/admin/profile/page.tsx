import { redirect } from "next/navigation";
import { AdminProfileForm } from "@/components/admin/AdminProfileForm";
import { getPasswordResetContext } from "@/lib/actions/password-reset";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getPasswordResetContext();
  if (!profile?.isAdmin) {
    redirect("/auth/sign-in?callbackUrl=/admin/profile");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          My profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your admin details and manage your password.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <AdminProfileForm
          name={profile.name}
          email={profile.email}
          phone={profile.phone}
          hasPassword={profile.hasPassword}
        />
      </div>
    </div>
  );
}
