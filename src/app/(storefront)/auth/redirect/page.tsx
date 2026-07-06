import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolvePostAuthDestination } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  redirect(
    resolvePostAuthDestination(callbackUrl, session.user.role),
  );
}
