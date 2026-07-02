"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomersAlsoLikeProps = {
  /** Server-rendered product cards (already wrapped in `.cal-card` slides). */
  children: ReactNode;
};

export function CustomersAlsoLike({ children }: CustomersAlsoLikeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const [revealed, setRevealed] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function scrollByCards(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 260);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Let touch devices use native momentum scrolling.
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
    setDragging(true);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    el.scrollLeft = drag.current.startScroll - delta;
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  }

  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    // Swallow the click that ends a drag so cards don't navigate mid-swipe.
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  }

  if (Children.count(children) === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={cn("cal-section mt-16 sm:mt-20", revealed && "cal-revealed")}
      aria-label="Customers also like"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="cal-header">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-coral">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Handpicked for you
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">
            Customers Also Like
          </h2>
          <div className="cal-underline mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-coral via-blush to-mint sm:w-20" />
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={atStart}
            aria-label="Scroll left"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/12 bg-white/90 text-navy shadow-sm backdrop-blur transition-all hover:border-coral/40 hover:text-coral hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-navy/12 disabled:hover:text-navy disabled:hover:shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={atEnd}
            aria-label="Scroll right"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/12 bg-white/90 text-navy shadow-sm backdrop-blur transition-all hover:border-coral/40 hover:text-coral hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-navy/12 disabled:hover:text-navy disabled:hover:shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#fffaf9] to-transparent transition-opacity duration-300 sm:w-14",
            atStart ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#fffaf9] to-transparent transition-opacity duration-300 sm:w-14",
            atEnd ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        />

        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className={cn(
            "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-0.5 pb-3 pt-1 sm:gap-5",
            dragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
