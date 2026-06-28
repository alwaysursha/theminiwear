"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/components/storefront/useScrollReveal";
import { cn } from "@/lib/utils";

export type SectionRevealVariant = "new-arrivals" | "on-sale" | "clearance" | "trending";

type HomepageProductSectionRevealProps = {
  revealVariant: SectionRevealVariant;
  className?: string;
  children: ReactNode;
};

export function HomepageProductSectionReveal({
  revealVariant,
  className,
  children,
}: HomepageProductSectionRevealProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      data-reveal={revealVariant}
      className={cn(
        "section-reveal relative overflow-hidden py-14",
        isVisible && "section-reveal-visible",
        className,
      )}
    >
      {revealVariant === "on-sale" && (
        <div className="section-reveal-sale-shimmer pointer-events-none absolute inset-0" aria-hidden />
      )}
      {revealVariant === "trending" && (
        <>
          <div
            className="section-reveal-trending-orb pointer-events-none absolute -left-20 top-8 h-48 w-48 rounded-full bg-mint/30 blur-3xl"
            aria-hidden
          />
          <div
            className="section-reveal-trending-orb pointer-events-none absolute -right-16 bottom-4 h-40 w-40 rounded-full bg-coral/15 blur-3xl"
            aria-hidden
          />
        </>
      )}
      {revealVariant === "clearance" && (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(200,240,224,0.12),transparent)]"
          aria-hidden
        />
      )}

      <div className="section-reveal-inner relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
