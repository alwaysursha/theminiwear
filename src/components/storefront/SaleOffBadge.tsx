import { cn } from "@/lib/utils";

const sizeConfig = {
  xs: {
    shell: "rounded-md px-2 py-1 shadow-[0_3px_12px_rgba(30,42,74,0.42)]",
    percent: "text-base",
    off: "text-[7px] tracking-[0.1em]",
  },
  sm: {
    shell: "rounded-md px-2 py-1 shadow-[0_4px_14px_rgba(30,42,74,0.44)]",
    percent: "text-lg",
    off: "text-[8px] tracking-[0.12em]",
  },
  md: {
    shell: "rounded-lg px-2.5 py-1.5 shadow-[0_5px_18px_rgba(30,42,74,0.48)]",
    percent: "text-xl",
    off: "text-[9px] tracking-[0.14em]",
  },
  lg: {
    shell: "rounded-lg px-3 py-2 shadow-[0_6px_22px_rgba(30,42,74,0.5)]",
    percent: "text-2xl",
    off: "text-[10px] tracking-[0.16em]",
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
    <span className="inline-flex items-baseline leading-none">
      <span className={cn("font-display font-extrabold text-coral", config.percent)}>
        {percent}
      </span>
      <span className="flex flex-col items-center leading-none">
        <span className={cn("font-display font-extrabold leading-none text-coral", config.percent)}>
          %
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
    </span>
  );

  if (inline) {
    return (
      <span
        className={cn(
          "pointer-events-none z-10 inline-flex rounded-full bg-navy font-display shadow-[0_4px_14px_rgba(30,42,74,0.35)] ring-1 ring-mint/30",
          config.shell,
          className,
        )}
        aria-label={`${percent} percent off`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "pointer-events-none z-10 inline-flex bg-gradient-to-b from-navy to-[#162038] ring-1 ring-mint/25",
        config.shell,
        !inline && "absolute right-2 top-2 sm:right-2.5 sm:top-2.5",
        className,
      )}
      aria-label={`${percent} percent off`}
    >
      {label}
    </span>
  );
}
