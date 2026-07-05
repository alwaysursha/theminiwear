"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HeroSlide } from "@/lib/hero-slider";
import { HeroBrandSlide } from "@/components/storefront/HeroBrandSlide";
import { HeroProductSlideView } from "@/components/storefront/HeroProductSlide";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 48;
const SWIPE_AXIS_LOCK_PX = 12;

type HeroSliderProps = {
  slides: HeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const activeRef = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeAxis = useRef<"x" | "y" | null>(null);
  const count = slides.length;
  const isPaused = hoverPaused || userPaused;

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

  const resetTouch = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    swipeAxis.current = null;
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (count <= 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      swipeAxis.current = null;
    },
    [count],
  );

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (swipeAxis.current === null) {
      if (
        Math.abs(deltaX) >= SWIPE_AXIS_LOCK_PX ||
        Math.abs(deltaY) >= SWIPE_AXIS_LOCK_PX
      ) {
        swipeAxis.current =
          Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      }
    }
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (count <= 1) {
        resetTouch();
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch || touchStartX.current === null || swipeAxis.current !== "x") {
        resetTouch();
        return;
      }

      const deltaX = touch.clientX - touchStartX.current;
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
        if (deltaX < 0) {
          next();
        } else {
          prev();
        }
      }

      resetTouch();
    },
    [count, next, prev, resetTouch],
  );

  const handleTouchCancel = useCallback(() => {
    resetTouch();
  }, [resetTouch]);

  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, isPaused, next]);

  if (count === 0) return null;

  return (
    <div className="bg-white">
      <section
        className="group/slider relative h-[min(80vh,38rem)] touch-pan-y overflow-hidden sm:h-[min(64vh,29rem)] lg:h-[min(66vh,34rem)]"
        aria-roledescription="carousel"
        aria-label="Featured highlights"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setHoverPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHoverPaused(false);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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
              onClick={() => setUserPaused((current) => !current)}
              className="absolute bottom-3 right-3 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/30 text-navy/50 shadow-[0_2px_8px_rgba(26,38,66,0.06)] backdrop-blur-sm transition-[background-color,color,opacity] hover:bg-white/50 hover:text-navy/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/35 sm:bottom-4 sm:right-4"
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={userPaused}
            >
              {userPaused ? (
                <Play className="h-3 w-3 fill-current" aria-hidden />
              ) : (
                <Pause className="h-3 w-3" aria-hidden />
              )}
            </button>
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
