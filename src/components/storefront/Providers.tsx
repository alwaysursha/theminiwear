"use client";

import { SessionProvider } from "next-auth/react";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";
import { CartAddedCelebration } from "@/components/storefront/CartAddedCelebration";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChunkErrorRecovery />
      <CartAddedCelebration />
      {children}
    </SessionProvider>
  );
}
