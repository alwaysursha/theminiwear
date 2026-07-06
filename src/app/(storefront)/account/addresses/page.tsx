import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressesManager } from "@/components/storefront/AddressesManager";
import { AccountChromeHidden } from "@/components/storefront/AccountPanelChrome";
import { AccountPageHeader } from "@/components/storefront/AccountPageHeader";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return (
    <div>
      <AccountChromeHidden>
        <AccountPageHeader
          title="Addresses"
          subtitle="Manage your shipping addresses"
        />
      </AccountChromeHidden>
      <div className="mt-6">
        <AddressesManager addresses={addresses} />
      </div>
    </div>
  );
}
