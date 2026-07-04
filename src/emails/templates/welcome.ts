import { renderEmailLayout } from "@/emails/layout";
import {
  renderProductSections,
  type EmailProductSection,
} from "@/emails/components/product-section";
import { EMAIL_COLORS, escapeHtml, getSiteUrl } from "@/emails/theme";

type WelcomeEmailProps = {
  name: string;
  sections?: EmailProductSection[];
};

export function renderWelcomeEmail({ name, sections = [] }: WelcomeEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const productSections = renderProductSections(sections);

  const perks = [
    "Track orders from your account",
    "Save favorites to your wishlist",
    "Be first to see new drops and sales",
  ]
    .map(
      (perk) =>
        `<tr>
          <td style="padding: 0 0 10px;">
            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <td style="width: 28px; vertical-align: top; font-size: 16px; line-height: 1.5;">✓</td>
                <td style="font-size: 15px; line-height: 1.5; color: ${EMAIL_COLORS.foreground};">${escapeHtml(perk)}</td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  return renderEmailLayout({
    preview: `Welcome to The Mini Wear, ${firstName}! Shop new arrivals, trending picks, and sale favorites.`,
    title: `Welcome, ${escapeHtml(firstName)}!`,
    body: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
        <tr>
          <td style="background: linear-gradient(135deg, ${EMAIL_COLORS.blush} 0%, #ffffff 55%, ${EMAIL_COLORS.mint}55 100%); border-radius: 18px; padding: 20px 22px; border: 1px solid rgba(30, 42, 74, 0.06);">
            <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.7;">
              Thanks for joining <strong>The Mini Wear</strong>. Your account is ready — adorable, comfy kids' fashion is just a click away.
            </p>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.muted};">
              Here is what you can do right now:
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px;">
              ${perks}
            </table>
          </td>
        </tr>
      </table>
      ${productSections}
      <p style="margin: ${productSections ? "24px" : "16px"} 0 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_COLORS.muted};">
        We hand-pick playful pieces for little adventurers. Start with the collections below or explore the full shop.
      </p>
    `,
    cta: {
      label: "Shop all styles",
      href: `${getSiteUrl()}/shop`,
    },
    footerNote: "You're receiving this because you created an account at The Mini Wear.",
  });
}
