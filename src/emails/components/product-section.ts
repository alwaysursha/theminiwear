import {
  EMAIL_COLORS,
  escapeHtml,
  getSiteUrl,
  toAbsoluteUrl,
} from "@/emails/theme";

export type EmailProductCard = {
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
  compareAtPrice?: string;
};

export type EmailProductSection = {
  title: string;
  href: string;
  products: EmailProductCard[];
};

function renderProductCard(product: EmailProductCard) {
  const productUrl = `${getSiteUrl()}/product/${product.slug}`;
  const priceHtml = product.compareAtPrice
    ? `<span style="font-weight: 700; color: ${EMAIL_COLORS.coral};">${escapeHtml(product.price)}</span>
       <span style="margin-left: 6px; font-size: 12px; color: ${EMAIL_COLORS.muted}; text-decoration: line-through;">${escapeHtml(product.compareAtPrice)}</span>`
    : `<span style="font-weight: 700; color: ${EMAIL_COLORS.navy};">${escapeHtml(product.price)}</span>`;

  return `<td width="50%" valign="top" style="padding: 8px;">
    <a href="${escapeHtml(productUrl)}" style="text-decoration: none; color: inherit; display: block;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #ffffff; border: 1px solid rgba(30, 42, 74, 0.08); border-radius: 16px; overflow: hidden;">
        <tr>
          <td style="padding: 0; background: ${EMAIL_COLORS.blush};">
            <img src="${escapeHtml(toAbsoluteUrl(product.imageUrl))}" alt="${escapeHtml(product.name)}" width="240" height="240" style="display: block; width: 100%; max-width: 240px; height: auto; aspect-ratio: 1 / 1; object-fit: cover; border: 0;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 14px 14px;">
            <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.4; font-weight: 700; color: ${EMAIL_COLORS.navy};">${escapeHtml(product.name)}</p>
            <p style="margin: 0; font-size: 14px;">${priceHtml}</p>
          </td>
        </tr>
      </table>
    </a>
  </td>`;
}

function renderProductRow(products: EmailProductCard[]) {
  const cells = products.map(renderProductCard).join("");
  const filler =
    products.length % 2 === 1
      ? `<td width="50%" style="padding: 8px;"></td>`
      : "";

  return `<tr>${cells}${filler}</tr>`;
}

export function renderProductSections(sections: EmailProductSection[]) {
  const visible = sections.filter((section) => section.products.length > 0);
  if (visible.length === 0) return "";

  return visible
    .map((section) => {
      const rows: string[] = [];
      for (let i = 0; i < section.products.length; i += 2) {
        rows.push(renderProductRow(section.products.slice(i, i + 2)));
      }

      return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 0;">
        <tr>
          <td style="padding-bottom: 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <p style="margin: 0; font-size: 18px; font-weight: 800; color: ${EMAIL_COLORS.navy};">${escapeHtml(section.title)}</p>
                </td>
                <td align="right">
                  <a href="${escapeHtml(`${getSiteUrl()}${section.href}`)}" style="font-size: 13px; font-weight: 700; color: ${EMAIL_COLORS.coral}; text-decoration: none;">Shop all →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${rows.join("")}
      </table>`;
    })
    .join("");
}
