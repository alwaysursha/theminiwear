"use client";

import { useTransition } from "react";
import { removeFromWishlist } from "@/app/(storefront)/account/wishlist/actions";

export function RemoveWishlistButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => {
          removeFromWishlist(productId);
        })
      }
      disabled={isPending}
      className="text-sm font-semibold text-coral hover:underline disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}
