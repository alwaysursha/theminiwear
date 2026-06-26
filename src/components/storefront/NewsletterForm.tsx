"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/app/(storefront)/actions";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);
    setStatus(result.success ? "success" : "error");
    if (result.success) {
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
      <Input
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
      />
      <Button
        type="submit"
        variant="secondary"
        disabled={status === "loading"}
        className="shrink-0"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </Button>
      {status === "success" && (
        <span className="sr-only">Subscribed successfully</span>
      )}
    </form>
  );
}
