"use client";

import { useState } from "react";
import { Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SizeGuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline"
      >
        <Ruler className="h-4 w-4" />
        Size guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close size guide"
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-navy">Size Guide</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-blush"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-navy" />
              </button>
            </div>
            <p className="mt-2 text-sm text-navy/60">
              Measurements are approximate. When in doubt, size up for growing kids!
            </p>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-left text-navy/60">
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Age</th>
                  <th className="py-2">Height</th>
                </tr>
              </thead>
              <tbody className="text-navy">
                {[
                  ["0-3M", "0–3 months", "Up to 24 in"],
                  ["3-6M", "3–6 months", "24–26 in"],
                  ["6-12M", "6–12 months", "26–29 in"],
                  ["12-18M", "12–18 months", "29–31 in"],
                  ["2T", "2 years", "33–36 in"],
                  ["3T", "3 years", "36–39 in"],
                  ["4T", "4 years", "39–42 in"],
                  ["5T", "5 years", "42–45 in"],
                ].map(([size, age, height]) => (
                  <tr key={size} className="border-b border-navy/5">
                    <td className="py-2 pr-4 font-semibold">{size}</td>
                    <td className="py-2 pr-4">{age}</td>
                    <td className="py-2">{height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
