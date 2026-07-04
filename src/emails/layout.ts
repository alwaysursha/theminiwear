import {
  EMAIL_COLORS,
  escapeHtml,
  getEmailLogoUrl,
  getSiteName,
  getSiteUrl,
} from "@/emails/theme";

type EmailLayoutProps = {
  preview?: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function renderEmailLayout({
  preview,
  title,
  body,
  cta,
  footerNote,
}: EmailLayoutProps) {
  const siteName = getSiteName();
  const siteUrl = getSiteUrl();
  const previewText = preview ?? title;

  const ctaBlock = cta
    ? `<tr>
        <td style="padding: 28px 32px 8px;">
          <a href="${escapeHtml(cta.href)}" style="display: inline-block; background: linear-gradient(125deg, ${EMAIL_COLORS.coral} 0%, #ff6b5a 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 999px;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>`
    : "";

  const footerExtra = footerNote
    ? `<p style="margin: 12px 0 0; font-size: 13px; line-height: 1.6; color: ${EMAIL_COLORS.muted};">${escapeHtml(footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${EMAIL_COLORS.blush}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, ${EMAIL_COLORS.blush} 0%, #ffffff 42%, ${EMAIL_COLORS.mint}33 100%); padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 50px rgba(30, 42, 74, 0.08);">
            <tr>
              <td style="height: 6px; background: linear-gradient(90deg, ${EMAIL_COLORS.coral}, #ffb8a8, ${EMAIL_COLORS.mint});"></td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px;" align="center">
                <a href="${escapeHtml(siteUrl)}" style="text-decoration: none; display: inline-block;">
                  <img
                    src="${escapeHtml(getEmailLogoUrl())}"
                    alt="${escapeHtml(siteName)}"
                    width="200"
                    style="display: block; width: 200px; max-width: 100%; height: auto; border: 0;"
                  />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 0;">
                <h1 style="margin: 0; font-size: 26px; line-height: 1.25; color: ${EMAIL_COLORS.navy};">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 8px; font-size: 16px; line-height: 1.7; color: ${EMAIL_COLORS.foreground};">
                ${body}
              </td>
            </tr>
            ${ctaBlock}
            <tr>
              <td style="padding: 28px 32px 32px; border-top: 1px solid rgba(30, 42, 74, 0.08);">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${EMAIL_COLORS.muted};">
                  Questions? Reply to this email or visit
                  <a href="${escapeHtml(siteUrl)}/contact" style="color: ${EMAIL_COLORS.coral}; text-decoration: none;">our contact page</a>.
                </p>
                ${footerExtra}
                <p style="margin: 16px 0 0; font-size: 12px; color: ${EMAIL_COLORS.muted};">
                  © ${new Date().getFullYear()} ${escapeHtml(siteName)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
