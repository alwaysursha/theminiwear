import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const { callbackUrl = "/account" } = await searchParams;

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (
    isAdminRole(session.user.role) &&
    (callbackUrl === "/account" || callbackUrl.startsWith("/account/"))
  ) {
    redirect("/admin");
  }

  redirect(callbackUrl);
}
