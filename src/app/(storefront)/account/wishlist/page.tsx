import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange, productInclude } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { AccountChromeHidden } from "@/components/storefront/AccountPanelChrome";
import { AccountPageHeader } from "@/components/storefront/AccountPageHeader";
import { RemoveWishlistButton } from "@/components/storefront/RemoveWishlistButton";
import { ShopProductCard } from "@/app/(storefront)/shop/ShopProductCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  const [items, siteSale] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId: session!.user.id },
      include: {
        product: { include: productInclude },
      },
      orderBy: { product: { name: "asc" } },
    }),
    getSiteSaleSettings(),
  ]);

  return (
    <div>
      <AccountChromeHidden>
        <AccountPageHeader
          title="Wishlist"
          subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} saved`}
        />
      </AccountChromeHidden>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-16 text-center">
          <p className="text-navy/60">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="mt-2 inline-block text-sm font-semibold text-coral hover:underline"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <ShopProductCard product={item.product} siteSale={siteSale} />
              <div className="absolute right-3 top-3 z-30">
                <RemoveWishlistButton productId={item.productId} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
