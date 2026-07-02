import { redirect } from "next/navigation";
import { signOut, requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/auth/sign-in" });
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  return (
    <AdminShell
      role={session.user.role}
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role}
      signOutAction={handleSignOut}
    >
      {children}
    </AdminShell>
  );
}
