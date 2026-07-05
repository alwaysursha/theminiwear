import { cn } from "@/lib/utils";

const sizeConfig = {
  xs: {
    shell: "h-9 w-9 shadow-[0_3px_12px_rgba(30,42,74,0.42)]",
    percent: "text-xs",
    percentSign: "text-[10px]",
    off: "text-[6px] tracking-[0.08em]",
  },
  sm: {
    shell: "h-10 w-10 shadow-[0_4px_14px_rgba(30,42,74,0.44)]",
    percent: "text-sm",
    percentSign: "text-[11px]",
    off: "text-[7px] tracking-[0.1em]",
  },
  md: {
    shell: "h-11 w-11 sm:h-12 sm:w-12 shadow-[0_5px_18px_rgba(30,42,74,0.48)]",
    percent: "text-base sm:text-lg",
    percentSign: "text-xs sm:text-sm",
    off: "text-[7px] sm:text-[8px] tracking-[0.12em]",
  },
  lg: {
    shell: "h-14 w-14 shadow-[0_6px_22px_rgba(30,42,74,0.5)]",
    percent: "text-xl",
    percentSign: "text-base",
    off: "text-[8px] tracking-[0.14em]",
  },
} as const;

export function SaleOffBadge({
  percent,
  className,
  size = "md",
  inline = false,
}: {
  percent: number;
  className?: string;
  size?: keyof typeof sizeConfig;
  /** When true, omits absolute positioning for use beside price text. */
  inline?: boolean;
}) {
  const config = sizeConfig[size];

  const label = (
    <span className="flex flex-col items-center justify-center leading-none">
      <span className="inline-flex items-baseline">
        <span className={cn("font-display font-extrabold text-coral", config.percent)}>
          {percent}
        </span>
        <span
          className={cn("font-display font-extrabold leading-none text-coral", config.percentSign)}
        >
          %
        </span>
      </span>
      <span
        className={cn(
          "-mt-px font-bold uppercase leading-none text-white/95",
          config.off,
        )}
      >
        off
      </span>
    </span>
  );

  const shellClass = cn(
    "pointer-events-none z-10 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-navy to-[#162038] font-display ring-1 ring-mint/25",
    config.shell,
    !inline && "absolute right-2 top-2 sm:right-2.5 sm:top-2.5",
    inline && "bg-navy shadow-[0_4px_14px_rgba(30,42,74,0.35)] ring-mint/30",
    className,
  );

  return (
    <span className={shellClass} aria-label={`${percent} percent off`}>
      {label}
    </span>
  );
}
