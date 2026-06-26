import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  className,
}: StarRatingProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <Star
            key={index}
            className={cn(
              iconClass,
              filled ? "fill-coral text-coral" : "fill-transparent text-navy/20",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
