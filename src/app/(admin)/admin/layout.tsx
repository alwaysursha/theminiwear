import { redirect } from "next/navigation";
import { signOut, requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <AdminHeader
          userName={session.user.name}
          userEmail={session.user.email}
          userRole={session.user.role}
          signOutAction={handleSignOut}
        />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
