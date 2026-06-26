import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/storefront/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy">Profile</h1>
      <p className="mt-1 text-sm text-navy/60">Manage your account details</p>
      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <ProfileForm
          name={user.name ?? ""}
          email={user.email}
          phone={user.phone ?? ""}
        />
      </div>
    </div>
  );
}
