import { renderEmailLayout } from "@/emails/layout";
import { textToHtml } from "@/emails/theme";

export function renderInquiryReplyEmail({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) {
  return renderEmailLayout({
    preview: `Reply from The Mini Wear: ${subject}`,
    title: `Re: ${subject}`,
    body: `<div style="margin: 0;">${textToHtml(message)}</div>`,
    footerNote: "You are receiving this because you contacted The Mini Wear support.",
  });
}
