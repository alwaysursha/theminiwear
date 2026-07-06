import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { renderInquiryReceivedEmail } from "../src/emails/templates/inquiry-received";
import { renderInquiryReplyEmail } from "../src/emails/templates/inquiry-reply";
import { renderOrderConfirmationEmail } from "../src/emails/templates/order-confirmation";
import { renderOrderShippedEmail } from "../src/emails/templates/order-shipped";
import { renderReturnRequestedEmail } from "../src/emails/templates/return-requested";
import { renderWelcomeEmail } from "../src/emails/templates/welcome";
import { EMAIL_SENDERS, formatOrderProductsSubject } from "../src/emails/theme";

const SAMPLE_PRODUCT = {
  name: "Rainbow Stripe Tee",
  slug: "rainbow-stripe-tee",
  imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=480&q=80",
  price: "$18.99",
  compareAtPrice: "$24.99",
};

const SAMPLE_PRODUCT_B = {
  name: "Cozy Fleece Joggers",
  slug: "mini-fleece-jogger-set",
  imageUrl: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=480&q=80",
  price: "$29.99",
};

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const PREVIEWS = [
  {
    name: "Welcome",
    from: EMAIL_SENDERS.hello,
    subject: "[Preview] Welcome to The Mini Wear",
    html: renderWelcomeEmail({
      name: "Faiza",
      sections: [
        {
          title: "New Arrivals",
          href: "/shop?new=true",
          products: [SAMPLE_PRODUCT, SAMPLE_PRODUCT_B],
        },
        {
          title: "Trending Now",
          href: "/shop?sort=trending",
          products: [SAMPLE_PRODUCT_B, SAMPLE_PRODUCT],
        },
        {
          title: "On Sale",
          href: "/shop?sale=true",
          products: [SAMPLE_PRODUCT, SAMPLE_PRODUCT_B],
        },
      ],
    }),
  },
  {
    name: "Order confirmation",
    from: EMAIL_SENDERS.orders,
    subject: `[Preview] Order confirmed — ${formatOrderProductsSubject(["Rainbow Stripe Tee", "Cozy Fleece Joggers"])}`,
    html: renderOrderConfirmationEmail({
      orderNumber: "TMW-00042",
      total: 68.5,
      items: [
        { name: "Rainbow Stripe Tee", quantity: 1, price: 24.99, size: "4T", color: "Multi" },
        { name: "Cozy Fleece Joggers", quantity: 1, price: 32.99, size: "4T", color: "Navy" },
      ],
    }),
  },
  {
    name: "Order shipped",
    from: EMAIL_SENDERS.orders,
    subject: `[Preview] Your order has shipped — ${formatOrderProductsSubject(["Rainbow Stripe Tee", "Cozy Fleece Joggers"])}`,
    html: renderOrderShippedEmail({
      orderNumber: "TMW-00042",
      carrier: "Canada Post",
      trackingNumber: "1234567890123456",
    }),
  },
  {
    name: "Inquiry received",
    from: EMAIL_SENDERS.support,
    subject: "[Preview] We received your message — Sizing question",
    html: renderInquiryReceivedEmail({
      name: "Faiza",
      subject: "Sizing question",
    }),
  },
  {
    name: "Inquiry reply",
    from: EMAIL_SENDERS.support,
    subject: "[Preview] Re: Sizing question",
    html: renderInquiryReplyEmail({
      subject: "Sizing question",
      message:
        "Hi Faiza,\n\nThanks for reaching out! For our 4T joggers, we recommend measuring waist and inseam against the size chart on the product page.\n\nHappy to help if you need anything else.",
    }),
  },
  {
    name: "Return requested",
    from: EMAIL_SENDERS.support,
    subject: `[Preview] Return request received — ${formatOrderProductsSubject(["Rainbow Stripe Tee"])}`,
    html: renderReturnRequestedEmail({
      orderNumber: "TMW-00042",
      reason: "Ordered the wrong size — would like to exchange for 5T.",
    }),
  },
] as const;

async function main() {
  loadEnvFile(".dev.vars");
  loadEnvFile(".env");

  const to = process.argv[2] ?? "Omsyed88@gmail.com";
  const key = process.env.RESEND_API_KEY;

  if (!key || key.includes("REPLACE")) {
    console.error("RESEND_API_KEY is missing in .dev.vars or .env");
    process.exit(1);
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  for (const preview of PREVIEWS) {
    const result = await resend.emails.send({
      from: preview.from,
      to,
      subject: preview.subject,
      html: preview.html,
    });

    if (result.error) {
      console.error(`Failed: ${preview.name}`, result.error);
      process.exit(1);
    }

    console.log(`Sent: ${preview.name} (id: ${result.data?.id})`);
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\nAll ${PREVIEWS.length} template previews sent to ${to}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
