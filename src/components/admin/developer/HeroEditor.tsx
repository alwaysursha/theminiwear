"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { HeroSettingsData } from "@/lib/cms/types";
import { HERO_GRADIENT_PRESETS } from "@/lib/cms/types";
import { saveHeroSettings } from "@/lib/actions/developer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/developer/ImageUploadField";
import { cn } from "@/lib/utils";

type HeroEditorProps = {
  hero: HeroSettingsData;
};

export function HeroEditor({ hero }: HeroEditorProps) {
  const [buttons, setButtons] = useState(hero.buttons);
  const [tiles, setTiles] = useState(hero.productTiles);
  const [backgroundType, setBackgroundType] = useState(hero.backgroundType);

  const gradientClass =
    HERO_GRADIENT_PRESETS[hero.gradientPreset] ??
    HERO_GRADIENT_PRESETS["blush-sky-mint"];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={saveHeroSettings} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="buttonsJson" value={JSON.stringify(buttons)} />
        <input type="hidden" name="productTilesJson" value={JSON.stringify(tiles)} />

        <div className="space-y-2">
          <Label htmlFor="eyebrow">Tag / eyebrow</Label>
          <Input id="eyebrow" name="eyebrow" defaultValue={hero.eyebrow} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={hero.headline} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="headlineAccent">Accent word (colored)</Label>
          <Input
            id="headlineAccent"
            name="headlineAccent"
            defaultValue={hero.headlineAccent ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={hero.description}
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Background</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="backgroundType"
                value="gradient"
                checked={backgroundType === "gradient"}
                onChange={() => setBackgroundType("gradient")}
              />
              Gradient
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="backgroundType"
                value="image"
                checked={backgroundType === "image"}
                onChange={() => setBackgroundType("image")}
              />
              Image
            </label>
          </div>
        </div>

        {backgroundType === "gradient" ? (
          <div className="space-y-2">
            <Label htmlFor="gradientPreset">Gradient preset</Label>
            <select
              id="gradientPreset"
              name="gradientPreset"
              defaultValue={hero.gradientPreset}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {Object.keys(HERO_GRADIENT_PRESETS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <ImageUploadField
            label="Background image"
            name="backgroundImageUrl"
            defaultUrl={hero.backgroundImageUrl}
            aspectRatio={16 / 9}
          />
        )}

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <Label>Buttons</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setButtons((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    label: "New button",
                    href: "/shop",
                    variant: "outline" as const,
                  },
                ])
              }
            >
              Add button
            </Button>
          </div>
          {buttons.map((btn, index) => (
            <div key={btn.id} className="grid gap-2 rounded-md border border-slate-100 p-3 sm:grid-cols-3">
              <Input
                value={btn.label}
                onChange={(e) =>
                  setButtons((prev) =>
                    prev.map((b, i) =>
                      i === index ? { ...b, label: e.target.value } : b,
                    ),
                  )
                }
                placeholder="Label"
              />
              <Input
                value={btn.href}
                onChange={(e) =>
                  setButtons((prev) =>
                    prev.map((b, i) =>
                      i === index ? { ...b, href: e.target.value } : b,
                    ),
                  )
                }
                placeholder="/shop"
              />
              <select
                value={btn.variant}
                onChange={(e) =>
                  setButtons((prev) =>
                    prev.map((b, i) =>
                      i === index
                        ? {
                            ...b,
                            variant: e.target.value === "outline" ? "outline" : "default",
                          }
                        : b,
                    ),
                  )
                }
                className="rounded-md border border-slate-200 px-2 text-sm"
              >
                <option value="default">Primary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <Label>Product image tiles</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTiles((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    imageUrl: "",
                    alt: "",
                    href: "/shop",
                  },
                ])
              }
            >
              Add tile
            </Button>
          </div>
          {tiles.map((tile, index) => (
            <div key={tile.id} className="space-y-2 rounded-md border border-slate-100 p-3">
              <Input
                value={tile.imageUrl}
                onChange={(e) =>
                  setTiles((prev) =>
                    prev.map((t, i) =>
                      i === index ? { ...t, imageUrl: e.target.value } : t,
                    ),
                  )
                }
                placeholder="Image URL"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={tile.alt}
                  onChange={(e) =>
                    setTiles((prev) =>
                      prev.map((t, i) =>
                        i === index ? { ...t, alt: e.target.value } : t,
                      ),
                    )
                  }
                  placeholder="Alt text"
                />
                <Input
                  value={tile.href}
                  onChange={(e) =>
                    setTiles((prev) =>
                      prev.map((t, i) =>
                        i === index ? { ...t, href: e.target.value } : t,
                      ),
                    )
                  }
                  placeholder="Link"
                />
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
          Save hero
        </Button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Live preview
        </p>
        <section
          className={cn(
            "relative overflow-hidden rounded-xl",
            backgroundType === "gradient" ? gradientClass : "bg-slate-200",
          )}
          style={
            backgroundType === "image" && hero.backgroundImageUrl
              ? {
                  backgroundImage: `url(${hero.backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="px-6 py-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-coral shadow-sm">
              <Sparkles className="h-3 w-3" />
              {hero.eyebrow}
            </span>
            <h3 className="mt-4 font-display text-2xl font-extrabold text-navy">
              {hero.headline}{" "}
              {hero.headlineAccent && (
                <span className="text-coral">{hero.headlineAccent}</span>
              )}
            </h3>
            <p className="mt-2 text-sm text-navy/70">{hero.description}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
