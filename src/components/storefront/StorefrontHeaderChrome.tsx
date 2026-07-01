"use client";

import { useCartUiStore } from "@/lib/cart-ui-store";
import { cn } from "@/lib/utils";

export function StorefrontHeaderChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const celebration = useCartUiStore((s) => s.celebration);

  return (
    <div
      id="site-header-chrome"
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        celebration && "z-[110] shadow-md",
      )}
    >
      {children}
    </div>
  );
}
