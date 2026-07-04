import { redirect } from "next/navigation";
import { auth, resolveSessionUser } from "@/lib/auth";
import { ProfileForm } from "@/components/storefront/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/sign-in?callbackUrl=/account/profile");
  }

  const user = await resolveSessionUser(session);

  const name = user?.name ?? session.user.name ?? "";
  const email = user?.email ?? session.user.email;
  const phone = user?.phone ?? "";

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy">Profile</h1>
      <p className="mt-1 text-sm text-navy/60">Manage your account details</p>
      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <ProfileForm name={name} email={email} phone={phone} />
      </div>
    </div>
  );
}
