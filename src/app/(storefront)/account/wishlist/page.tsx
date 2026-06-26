import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange, productInclude } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { RemoveWishlistButton } from "@/components/storefront/RemoveWishlistButton";

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
      <h1 className="font-display text-2xl font-extrabold text-navy">Wishlist</h1>
      <p className="mt-1 text-sm text-navy/60">
        {items.length} item{items.length !== 1 ? "s" : ""} saved
      </p>

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
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const image = item.product.images[0];
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
              >
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sky/30"
                >
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      👕
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-display font-bold text-navy hover:text-coral"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm font-semibold text-coral">
                    {getProductPriceRange(item.product.variants, item.product, siteSale).display}
                  </p>
                  <div className="mt-auto">
                    <RemoveWishlistButton productId={item.productId} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
