import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressesManager } from "@/components/storefront/AddressesManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy">
        Addresses
      </h1>
      <p className="mt-1 text-sm text-navy/60">Manage your shipping addresses</p>
      <div className="mt-6">
        <AddressesManager addresses={addresses} />
      </div>
    </div>
  );
}
