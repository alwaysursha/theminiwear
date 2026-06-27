import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { HeroSettingsData } from "@/lib/cms/types";
import { HERO_GRADIENT_PRESETS } from "@/lib/cms/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function HeroSection({ hero }: { hero: HeroSettingsData }) {
  const gradientClass =
    HERO_GRADIENT_PRESETS[hero.gradientPreset] ??
    HERO_GRADIENT_PRESETS["blush-sky-mint"];

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        hero.backgroundType === "gradient" ? gradientClass : "bg-slate-200",
      )}
      style={
        hero.backgroundType === "image" && hero.backgroundImageUrl
          ? {
              backgroundImage: `url(${hero.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-mint/40 blur-2xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            {hero.eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-coral shadow-sm">
                <Sparkles className="h-4 w-4" />
                {hero.eyebrow}
              </span>
            )}
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
              {hero.headline}{" "}
              {hero.headlineAccent && (
                <span className="text-coral">{hero.headlineAccent}</span>
              )}
            </h1>
            <p className="mt-4 text-lg text-navy/70">{hero.description}</p>
            {hero.buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {hero.buttons.map((btn) => (
                  <Link
                    key={btn.id}
                    href={btn.href}
                    className={cn(
                      buttonVariants({
                        variant: btn.variant === "outline" ? "outline" : "default",
                        size: "lg",
                      }),
                    )}
                  >
                    {btn.label}
                    {btn.variant === "default" && (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {hero.productTiles.length > 0 && (
            <div className="hidden gap-3 sm:grid sm:grid-cols-2">
              {hero.productTiles.slice(0, 4).map((tile) => (
                <Link
                  key={tile.id}
                  href={tile.href}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-lg"
                >
                  {tile.imageUrl && (
                    <Image
                      src={tile.imageUrl}
                      alt={tile.alt || ""}
                      fill
                      className="object-cover"
                      unoptimized={tile.imageUrl.startsWith("/cms-uploads")}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
