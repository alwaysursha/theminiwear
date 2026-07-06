"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { removeFromWishlist } from "@/app/(storefront)/account/wishlist/actions";
import { cn } from "@/lib/utils";

export function RemoveWishlistButton({
  productId,
  compact = false,
}: {
  productId: string;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          startTransition(() => {
            removeFromWishlist(productId);
          });
        }}
        disabled={isPending}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-navy shadow-md transition-colors hover:bg-white hover:text-coral disabled:opacity-50",
        )}
        aria-label={isPending ? "Removing from wishlist" : "Remove from wishlist"}
      >
        <X className="h-4 w-4" />
      </button>
    );
  }

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
