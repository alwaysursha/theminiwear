"use client";

import { SessionProvider } from "next-auth/react";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";
import { CartAddedCelebration } from "@/components/storefront/CartAddedCelebration";
import { AuthToast } from "@/components/storefront/AuthToast";
import { CartSync } from "@/components/storefront/CartSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      <ChunkErrorRecovery />
      <CartSync />
      <CartAddedCelebration />
      <AuthToast />
      {children}
    </SessionProvider>
  );
}
