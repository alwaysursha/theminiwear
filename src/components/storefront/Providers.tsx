"use client";

import { SessionProvider } from "next-auth/react";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChunkErrorRecovery />
      {children}
    </SessionProvider>
  );
}
