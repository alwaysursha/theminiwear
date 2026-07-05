"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { mergeUserCart, saveUserCart } from "@/lib/actions/cart";
import { cartItemToSyncItem } from "@/lib/cart-db";
import { useCartStore } from "@/lib/cart-store";

const SAVE_DEBOUNCE_MS = 600;

export function CartSync() {
  const { status, data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const mergedForUserRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      mergedForUserRef.current = null;
      return;
    }

    if (mergedForUserRef.current === session.user.id) {
      return;
    }

    let cancelled = false;

    async function syncOnLogin() {
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

      mergedForUserRef.current = session!.user!.id;
    }

    void syncOnLogin();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, setItems]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    if (mergedForUserRef.current !== session.user.id) {
      return;
    }

    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const syncItems = useCartStore.getState().items.map(cartItemToSyncItem);
      void saveUserCart(syncItems);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [items, status, session?.user?.id]);

  return null;
}
