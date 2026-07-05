"use client";

import { Megaphone } from "lucide-react";
import type { TickerSettings } from "@/lib/ticker";
import { saveTickerSettings } from "@/lib/actions/developer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TickerEditor({ ticker }: { ticker: TickerSettings }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        action={saveTickerSettings}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Announcement ticker</h3>
        </div>
        <p className="text-sm text-slate-500">
          Edit the scrolling bar at the top of the storefront. Segments are
          separated by a slash in the live ticker.
        </p>

        <div className="space-y-2">
          <Label htmlFor="customLine">Custom line (optional)</Label>
          <Input
            id="customLine"
            name="customLine"
            defaultValue={ticker.customLine}
            placeholder="e.g. New spring collection just dropped"
            className="rounded-lg border-slate-200"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            name="showFreeShipping"
            defaultChecked={ticker.showFreeShipping}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Include free shipping threshold (from Shipping settings)
          </span>
        </label>

        <div className="space-y-2">
          <Label htmlFor="secondaryLine">Shipping / processing message</Label>
          <Textarea
            id="secondaryLine"
            name="secondaryLine"
            rows={2}
            defaultValue={ticker.secondaryLine}
            className="rounded-lg border-slate-200"
          />
        </div>

        <Button
          type="submit"
          className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Save ticker
        </Button>
      </form>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Preview order
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          {ticker.customLine.trim() && <li>{ticker.customLine}</li>}
          {ticker.showFreeShipping && (
            <li>Free shipping threshold (auto)</li>
          )}
          <li>{ticker.secondaryLine}</li>
        </ol>
        <p className="mt-4 text-xs text-slate-400">
          When site-wide sale is on, a red banner appears below this ticker
          automatically.
        </p>
      </div>
    </div>
  );
}
