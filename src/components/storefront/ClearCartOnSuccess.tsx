"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { clearUserCart } from "@/lib/actions/cart";
import { useCartStore } from "@/lib/cart-store";

export function ClearCartOnSuccess() {
  const { status } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();

    if (status === "authenticated") {
      void clearUserCart();
    }
  }, [clearCart, status]);

  return null;
}
