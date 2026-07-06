"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { loadUserCart, mergeUserCart, saveUserCart } from "@/lib/actions/cart";
import { cartItemToSyncItem } from "@/lib/cart-db";
import { useCartStore } from "@/lib/cart-store";

const SAVE_DEBOUNCE_MS = 600;

export function CartSync() {
  const { status, data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const syncedForUserRef = useRef<string | null>(null);
  const prevStatusRef = useRef<"authenticated" | "unauthenticated" | "loading" | null>(
    null,
  );
  const saveTimerRef = useRef<number | null>(null);
  const prevItemsRef = useRef(items);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      if (status === "unauthenticated") {
        syncedForUserRef.current = null;
      }
      prevStatusRef.current = status;
      return;
    }

    if (syncedForUserRef.current === session.user.id) {
      prevStatusRef.current = status;
      return;
    }

    const justSignedIn = prevStatusRef.current === "unauthenticated";
    prevStatusRef.current = status;

    let cancelled = false;

    async function syncCart() {
      if (justSignedIn) {
        const localItems = useCartStore
          .getState()
          .items.map(cartItemToSyncItem);
        const result = await mergeUserCart(localItems);

        if (cancelled) {
          return;
        }

        if ("items" in result) {
          setItems(result.items);
        }
      } else {
        const result = await loadUserCart();

        if (cancelled) {
          return;
        }

        if ("items" in result) {
          setItems(result.items);
        }
      }

      syncedForUserRef.current = session!.user!.id;
    }

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, setItems]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    if (syncedForUserRef.current !== session.user.id) {
      return;
    }

    const prevItems = prevItemsRef.current;
    prevItemsRef.current = items;

    const itemCountDecreased = items.length < prevItems.length;
    const cleared = items.length === 0 && prevItems.length > 0;
    const delay = itemCountDecreased || cleared ? 0 : SAVE_DEBOUNCE_MS;

    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const syncItems = useCartStore.getState().items.map(cartItemToSyncItem);
      void saveUserCart(syncItems);
    }, delay);

    return () => {
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [items, status, session?.user?.id]);

  return null;
}
