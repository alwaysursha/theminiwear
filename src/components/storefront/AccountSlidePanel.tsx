"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { AccountPanelTabs } from "@/components/storefront/AccountPanelTabs";
import { AccountPanelOrders } from "@/components/storefront/panel/AccountPanelOrders";
import { AccountPanelWishlist } from "@/components/storefront/panel/AccountPanelWishlist";
import { AccountPanelAddresses } from "@/components/storefront/panel/AccountPanelAddresses";
import { AccountPanelMessages } from "@/components/storefront/panel/AccountPanelMessages";
import { AccountPanelProfile } from "@/components/storefront/panel/AccountPanelProfile";
import { cn } from "@/lib/utils";

function PanelContentSkeleton() {
  return (
    <div className="account-panel-dark animate-pulse space-y-2.5 py-1">
      <div className="h-6 w-32 rounded-md bg-white/10" />
      <div className="account-panel-card h-14" />
      <div className="account-panel-card h-14" />
    </div>
  );
}

export function AccountSlidePanel() {
  const isOpen = useAccountPanelStore((s) => s.isOpen);
  const activeSection = useAccountPanelStore((s) => s.activeSection);
  const close = useAccountPanelStore((s) => s.close);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [motionPhase, setMotionPhase] = useState<"idle" | "opening" | "open" | "closing">(
    "idle",
  );

  useLayoutEffect(() => {
    if (isOpen) {
      setMotionPhase("opening");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const openTimer = window.setTimeout(() => setMotionPhase("open"), 680);
      const contentTimer = window.setTimeout(() => setShowContent(true), 240);
      return () => {
        window.clearTimeout(openTimer);
        window.clearTimeout(contentTimer);
      };
    }

    setShowContent(false);
    setMotionPhase((phase) => (phase === "idle" ? "idle" : "closing"));
    const closeTimer = window.setTimeout(() => setMotionPhase("idle"), 520);
    return () => window.clearTimeout(closeTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !showContent) {
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
    setRefreshKey((key) => key + 1);
  }, [activeSection, isOpen, showContent]);

  if (!isOpen && motionPhase === "idle") {
    return null;
  }

  const isOpening = motionPhase === "opening";
  const isClosing = motionPhase === "closing";
  const isSettledOpen = motionPhase === "open";

  return (
    <div
      className={cn(
        "account-slide-panel grid",
        isOpen || isOpening
          ? "account-slide-panel--open"
          : "account-slide-panel--closed grid-rows-[0fr]",
      )}
      aria-hidden={!isOpen && !isOpening}
    >
      <div className="h-full min-h-0 overflow-hidden">
        <div
          className={cn(
            "account-slide-panel-inner relative flex h-full flex-col overflow-hidden",
            motionPhase === "opening" && "account-slide-panel-inner--opening",
            isSettledOpen && "account-slide-panel-inner--open",
            isClosing && "account-slide-panel-inner--closing",
          )}
        >
          <div className="account-slide-panel-aura pointer-events-none absolute inset-0" aria-hidden />

          <div
            className="account-slide-panel-topline pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px]"
            aria-hidden
          />

          <div className="account-slide-panel-shimmer pointer-events-none absolute inset-x-0 top-[3px] z-20 h-px overflow-hidden" aria-hidden>
            <div className="account-slide-panel-shimmer-bar h-full w-2/5 bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          <div className="account-slide-panel-stagger account-slide-panel-stagger-1 relative z-10 flex shrink-0 justify-center border-b border-white/8 bg-[#121b31]/90 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={close}
              className="account-panel-close group relative flex flex-col items-center gap-0.5 rounded-full px-4 py-1 text-white/65 transition-colors hover:bg-white/8 hover:text-coral"
              aria-label="Hide dashboard"
            >
              <span className="account-panel-close-ring pointer-events-none absolute inset-0 rounded-full" aria-hidden />
              <ChevronUp className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
              <span className="relative text-[9px] font-bold uppercase tracking-[0.14em]">
                Hide Dashboard
              </span>
            </button>
          </div>

          <div className="account-slide-panel-stagger account-slide-panel-stagger-2 relative z-10 shrink-0">
            <AccountPanelTabs />
          </div>

          <div
            ref={scrollRef}
            className="account-slide-panel-stagger account-slide-panel-stagger-3 account-panel-dark relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
          >
            <div className="mx-auto max-w-5xl">
              {!showContent ? (
                <PanelContentSkeleton />
              ) : (
                <div key={activeSection} className="account-panel-section-in">
                  {activeSection === "orders" && (
                    <AccountPanelOrders refreshKey={refreshKey} />
                  )}
                  {activeSection === "wishlist" && (
                    <AccountPanelWishlist refreshKey={refreshKey} />
                  )}
                  {activeSection === "addresses" && (
                    <AccountPanelAddresses refreshKey={refreshKey} />
                  )}
                  {activeSection === "messages" && (
                    <AccountPanelMessages refreshKey={refreshKey} />
                  )}
                  {activeSection === "profile" && (
                    <AccountPanelProfile refreshKey={refreshKey} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
