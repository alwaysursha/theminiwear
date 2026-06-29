export const SITE_NAME = "The Mini Wear";
export const SITE_DESCRIPTION =
  "Adorable, comfortable kids clothing for every adventure.";

/** E.164 digits only — used for wa.me links */
export const WHATSAPP_PHONE_E164 = "16476295666";
export const WHATSAPP_DISPLAY = "+1 (647) 629 5666";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE_E164}`;
export const WHATSAPP_MESSAGE_INTRO = "Hi, I have a question!";

export function buildWhatsAppUrl(pageUrl: string) {
  const text = `${WHATSAPP_MESSAGE_INTRO}\n\n${pageUrl}`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}

export const AGE_GROUPS = [
  "0-3M",
  "3-6M",
  "6-12M",
  "12-18M",
  "18-24M",
  "2T",
  "3T",
  "4T",
  "5T",
  "6T",
  "7",
  "8",
  "10",
  "12",
  "14",
] as const;

export const SIZES = [
  "NB",
  "0-3M",
  "3-6M",
  "6-12M",
  "12M",
  "18M",
  "24M",
  "2T",
  "3T",
  "4T",
  "5T",
  "XS",
  "S",
  "M",
  "L",
  "XL",
] as const;

export const COLORS = [
  "White",
  "Pink",
  "Blue",
  "Mint",
  "Yellow",
  "Coral",
  "Navy",
  "Gray",
  "Multi",
] as const;

export const ADMIN_ROLES = ["ADMIN", "ORDER_MANAGER", "SUPPORT_AGENT"] as const;

export function isAdminRole(role: string) {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function getDashboardPath(role: string) {
  return isAdminRole(role) ? "/admin" : "/account";
}
