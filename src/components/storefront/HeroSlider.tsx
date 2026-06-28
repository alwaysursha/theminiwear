"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/hero-slider";
import { HeroBrandSlide } from "@/components/storefront/HeroBrandSlide";
import { HeroProductSlideView } from "@/components/storefront/HeroProductSlide";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;

type HeroSliderProps = {
  slides: HeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const activeRef = useRef(0);
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      if (activeRef.current === next) return;

      activeRef.current = next;
      setActive(next);
      setFlashKey((key) => key + 1);
    },
    [count],
  );

  const next = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, next]);

  if (count === 0) return null;

  return (
    <div className="bg-white">
      <section
        className="group/slider relative h-[min(62vh,27rem)] overflow-hidden sm:h-[min(64vh,29rem)] lg:h-[min(66vh,34rem)]"
        aria-roledescription="carousel"
        aria-label="Featured highlights"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="relative h-full min-h-0 bg-white">
          {slides.map((slide, index) => {
            const isActive = index === active;

            return (
              <div
                key={slide.id}
                className={cn(
                  "absolute inset-0 overflow-hidden will-change-[opacity,visibility]",
                  "motion-reduce:transition-none",
                  isActive
                    ? "hero-slide-visible z-10"
                    : "hero-slide-hidden z-0 pointer-events-none",
                )}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${count}`}
                aria-hidden={!isActive}
              >
                <div className="h-full min-h-0">
                  {slide.type === "brand" ? (
                    <HeroBrandSlide hero={slide.hero} />
                  ) : slide.type === "product-ad" ? (
                    <HeroProductSlideView slide={slide} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && flashKey > 0 && (
          <div
            key={flashKey}
            className="hero-flash-overlay pointer-events-none absolute inset-0 z-30 animate-hero-flash motion-reduce:hidden"
            aria-hidden
          />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-navy shadow-[0_4px_16px_rgba(26,38,66,0.12)] opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-coral/40 group-hover/slider:opacity-100 sm:left-4 sm:h-10 sm:w-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-navy shadow-[0_4px_16px_rgba(26,38,66,0.12)] opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-coral/40 group-hover/slider:opacity-100 sm:right-4 sm:h-10 sm:w-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </section>

      {count > 1 && (
        <div className="flex justify-center py-2.5">
          <div
            className="flex items-center gap-1.5 rounded-full border border-navy/10 bg-white px-3 py-1.5 shadow-[0_2px_12px_rgba(26,38,66,0.08)]"
            role="tablist"
            aria-label="Slide pagination"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                onClick={() => goTo(index)}
                className={cn(
                  "rounded-full transition-all duration-500 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/50",
                  index === active
                    ? "h-2 w-5 bg-coral shadow-sm"
                    : "h-2 w-2 bg-navy/20 hover:bg-coral/35",
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === active}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
