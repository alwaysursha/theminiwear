"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitProductReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  productId: string;
};

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (success) {
    return (
      <div className="rounded-2xl border border-coral/20 bg-coral/5 p-5">
        <p className="font-medium text-navy">Thank you for your review.</p>
        <p className="mt-1 text-sm text-navy/60">
          It will appear on this page once approved by our team.
        </p>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await submitProductReview(productId, formData);
      if (result.success) {
        setSuccess(true);
        return;
      }
      setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-navy/10 bg-white p-5">
      <h3 className="font-display text-lg font-bold text-navy">Write a review</h3>
      <p className="mt-1 text-sm text-navy/55">
        Verified purchasers only. Reviews cannot be edited after submission.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const active = value <= (hoverRating || rating);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      active ? "fill-coral text-coral" : "text-navy/20",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" name="title" maxLength={120} placeholder="Summarize your experience" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Review</Label>
          <Textarea
            id="body"
            name="body"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder="Tell other parents what you loved about this item..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={isPending || rating === 0}>
          {isPending ? "Submitting..." : "Submit review"}
        </Button>
      </div>
    </form>
  );
}

type ReviewFormGateProps = {
  productId: string;
  isLoggedIn: boolean;
  canReview: boolean;
  existingStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
};

export function ReviewFormGate({
  productId,
  isLoggedIn,
  canReview,
  existingStatus,
}: ReviewFormGateProps) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-blush/20 p-5 text-sm text-navy/70">
        <Link href="/auth/sign-in" className="font-semibold text-coral hover:underline">
          Sign in
        </Link>{" "}
        to leave a review. Only verified purchasers can review after delivery.
      </div>
    );
  }

  if (existingStatus === "PENDING") {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-5 text-sm text-navy/70">
        Your review is pending approval and will appear here once published.
      </div>
    );
  }

  if (existingStatus === "APPROVED" || existingStatus === "REJECTED") {
    return null;
  }

  if (!canReview) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-5 text-sm text-navy/70">
        Only customers who have received this item can leave a review.
      </div>
    );
  }

  return <ReviewForm productId={productId} />;
}
