"use client";

import { SessionProvider } from "next-auth/react";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";
import { CartAddedCelebration } from "@/components/storefront/CartAddedCelebration";
import { AuthToast } from "@/components/storefront/AuthToast";
import { CartSync } from "@/components/storefront/CartSync";
import { StoreConfigProvider } from "@/components/storefront/StoreConfigProvider";

export function Providers({
  currency = "CAD",
  children,
}: {
  currency?: string;
  children: React.ReactNode;
}) {
  return (
    <StoreConfigProvider currency={currency}>
      <SessionProvider refetchOnWindowFocus>
        <ChunkErrorRecovery />
        <CartSync />
        <CartAddedCelebration />
        <AuthToast />
        {children}
      </SessionProvider>
    </StoreConfigProvider>
  );
}
