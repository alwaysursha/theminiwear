import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/constants";
import { AccountLayoutShell } from "@/components/storefront/AccountPanelChrome";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "My account",
  "Manage your orders, addresses, and profile.",
);

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/account/orders");
  }

  if (isAdminRole(session.user.role)) {
    redirect("/admin");
  }

  return <AccountLayoutShell>{children}</AccountLayoutShell>;
}
