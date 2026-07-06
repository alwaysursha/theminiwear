import type { Role } from "@prisma/client";

export type AdminSection =
  | "dashboard"
  | "products"
  | "orders"
  | "inquiries"
  | "customers"
  | "shipping"
  | "discounts"
  | "analytics"
  | "settings"
  | "reviews"
  | "developer"
  | "returns"
  | "newsletter"
  | "profile";

const rolePermissions: Record<Role, AdminSection[]> = {
  ADMIN: [
    "dashboard",
    "products",
    "orders",
    "inquiries",
    "customers",
    "shipping",
    "discounts",
    "analytics",
    "settings",
    "reviews",
    "developer",
    "returns",
    "newsletter",
    "profile",
  ],
  ORDER_MANAGER: [
    "dashboard",
    "orders",
    "shipping",
    "analytics",
    "returns",
    "profile",
  ],
  SUPPORT_AGENT: ["dashboard", "inquiries", "customers", "returns", "profile"],
  USER: [],
};

export function canAccessAdminSection(role: Role, section: AdminSection) {
  return rolePermissions[role]?.includes(section) ?? false;
}

export function getAdminSectionsForRole(role: Role) {
  return rolePermissions[role] ?? [];
}

const PATH_SEGMENT_TO_SECTION: Record<string, AdminSection> = {
  products: "products",
  reviews: "reviews",
  orders: "orders",
  inquiries: "inquiries",
  customers: "customers",
  shipping: "shipping",
  discounts: "discounts",
  analytics: "analytics",
  developer: "developer",
  settings: "settings",
  returns: "returns",
  newsletter: "newsletter",
  profile: "profile",
};

/** Resolve admin nav section from a pathname like /admin/orders/abc. */
export function adminSectionFromPath(pathname: string): AdminSection {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "dashboard";
  }

  const segment = pathname.split("/")[2];
  return PATH_SEGMENT_TO_SECTION[segment ?? ""] ?? "dashboard";
}
