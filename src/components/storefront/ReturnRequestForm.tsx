"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requestReturn } from "@/app/(storefront)/account/orders/actions";

export function ReturnRequestForm({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await requestReturn(orderId, new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setMessage(result.error ?? "Failed to submit return request");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-mint bg-mint/20 p-5">
        <p className="font-semibold text-navy">Return request submitted</p>
        <p className="mt-1 text-sm text-navy/70">
          We will review your request and email you within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm"
    >
      <h2 className="font-display font-bold text-navy">Request a Return</h2>
      <p className="mt-1 text-sm text-navy/60">
        Tell us why you would like to return this order.
      </p>
      <div className="mt-4 space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          required
          placeholder="Item didn't fit, wrong size, damaged, etc."
        />
      </div>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? "Submitting..." : "Submit Return Request"}
      </Button>
    </form>
  );
}
