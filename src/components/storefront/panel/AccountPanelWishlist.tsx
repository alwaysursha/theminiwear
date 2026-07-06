"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchAccountPanelWishlist } from "@/lib/actions/account-panel";
import { RemoveWishlistButton } from "@/components/storefront/RemoveWishlistButton";
import {
  AccountPanelCard,
  AccountPanelEmpty,
  AccountPanelHeader,
  AccountPanelSkeleton,
} from "@/components/storefront/panel/account-panel-ui";

type WishlistData = Awaited<ReturnType<typeof fetchAccountPanelWishlist>>;

export function AccountPanelWishlist({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [data, setData] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountPanelWishlist();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return <AccountPanelSkeleton />;
  }

  if (!data || "error" in data) {
    return (
      <p className="account-panel-muted py-6 text-center text-xs">
        Could not load wishlist.
      </p>
    );
  }

  const { items } = data;

  return (
    <>
      <AccountPanelHeader
        title="Wishlist"
        subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} saved`}
      />

      {items.length === 0 ? (
        <AccountPanelEmpty
          message="Your wishlist is empty"
          actionLabel="Discover products"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <AccountPanelCard key={item.id} className="group p-2">
              <div className="relative z-[1]">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative mb-2 block aspect-[4/5] overflow-hidden rounded-lg bg-white/10"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="120px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">
                      👕
                    </div>
                  )}
                </Link>
                <div className="absolute right-1 top-1 z-20">
                  <RemoveWishlistButton productId={item.productId} compact />
                </div>
                <Link href={`/product/${item.slug}`} className="block min-w-0">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-[#ff9d70]">
                    {item.priceDisplay}
                  </p>
                </Link>
              </div>
            </AccountPanelCard>
          ))}
        </div>
      )}
    </>
  );
}
