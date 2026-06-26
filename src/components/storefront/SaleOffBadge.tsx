import { cn } from "@/lib/utils";

export function SaleOffBadge({
  percent,
  className,
  size = "md",
}: {
  percent: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-center justify-center rounded-full bg-coral text-center text-white shadow-lg ring-4 ring-white/90",
        size === "sm" && "h-[4.5rem] w-[4.5rem]",
        size === "md" && "h-20 w-20",
        size === "lg" && "h-24 w-24",
        className,
      )}
      aria-label={`Now ${percent} percent off`}
    >
      <span className="text-[9px] font-extrabold uppercase leading-none tracking-wider">
        Now
      </span>
      <span
        className={cn(
          "font-display font-extrabold leading-none",
          size === "lg" ? "text-2xl" : "text-xl",
        )}
      >
        {percent}%
      </span>
      <span className="text-[9px] font-extrabold uppercase leading-none tracking-wider">
        Off
      </span>
    </div>
  );
}
