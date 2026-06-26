import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const addresses = session?.user?.id
    ? await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { label: "asc" }],
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-extrabold text-navy">
        Checkout
      </h1>
      <CheckoutForm
        addresses={addresses}
        userEmail={session?.user?.email}
        isLoggedIn={!!session?.user}
      />
    </div>
  );
}
