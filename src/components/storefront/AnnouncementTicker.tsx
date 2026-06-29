"use client";

const SP = " ".repeat(20);

const ANNOUNCEMENT = `Free shipping on orders over $100${SP}/${SP}Orders processed and shipped within 2-5 business days${SP}/${SP}`;

const REPEATS_PER_TRACK = 10;

function TickerTrack({ hidden }: { hidden?: boolean }) {
  const content = ANNOUNCEMENT.repeat(REPEATS_PER_TRACK);

  return (
    <span
      className="shrink-0 whitespace-pre text-sm font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(30,42,74,0.35)]"
      aria-hidden={hidden}
    >
      {content}
    </span>
  );
}

export function AnnouncementTicker() {
  return (
    <div
      className="group relative overflow-hidden py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_3px_10px_rgba(0,0,0,0.22)]"
      role="region"
      aria-label="Store announcements"
    >
      <div
        className="absolute inset-0 animate-aurora-shift bg-[length:320%_100%] bg-[linear-gradient(110deg,#1e2a4a_0%,#3d5a8c_16%,#ff7f6e_34%,#f4a4b8_48%,#7ecfc0_62%,#5a8fd4_78%,#1e2a4a_100%)]"
        aria-hidden
      />

      <div
        className="absolute -left-8 top-1/2 h-10 w-28 -translate-y-1/2 animate-orb-drift rounded-full bg-coral/50 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute left-1/3 top-1/2 h-8 w-24 -translate-y-1/2 animate-orb-drift rounded-full bg-mint/45 blur-2xl [animation-delay:-5s]"
        aria-hidden
      />
      <div
        className="absolute right-1/4 top-1/2 h-9 w-32 -translate-y-1/2 animate-orb-drift rounded-full bg-sky/50 blur-2xl [animation-delay:-9s]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-y-0 w-1/2 animate-ticker-shimmer bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.18)_50%,transparent_65%)]" />
      </div>

      <div className="relative z-10 flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <TickerTrack />
        <TickerTrack hidden />
      </div>
    </div>
  );
}
