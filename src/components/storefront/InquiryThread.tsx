"use client";

import { useState } from "react";
import { format } from "date-fns";
import { replyToInquiry } from "@/app/(storefront)/account/inquiries/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InquiryMessage } from "@prisma/client";

export function InquiryThread({
  inquiryId,
  messages,
}: {
  inquiryId: string;
  messages: InquiryMessage[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await replyToInquiry(new FormData(e.currentTarget));
    setLoading(false);
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl p-4 ${
              msg.isStaff
                ? "ml-8 bg-sky/30"
                : "mr-8 bg-blush/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-navy/60">
                {msg.isStaff ? "Support Team" : "You"}
              </p>
              <p className="text-xs text-navy/40">
                {format(msg.createdAt, "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <p className="mt-2 text-sm text-navy/80 whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="inquiryId" value={inquiryId} />
        <Textarea
          name="content"
          placeholder="Type your reply..."
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reply"}
        </Button>
      </form>
    </div>
  );
}
