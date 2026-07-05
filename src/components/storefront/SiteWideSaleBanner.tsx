export function SiteWideSaleBanner({ percent }: { percent: number }) {
  return (
    <div
      className="relative z-10 border-b border-red-900/20 bg-red-600 px-4 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-bold tracking-wide text-white sm:text-base">
        SITE-WIDE SALE — EXTRA {percent}% OFF EVERYTHING
      </p>
    </div>
  );
}
