import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/constants";
import { AccountNav } from "@/components/storefront/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/account");
  }

  if (isAdminRole(session.user.role)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 px-4 font-display text-sm font-bold uppercase tracking-wider text-navy/50">
            My Account
          </h2>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
