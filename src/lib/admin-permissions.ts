import type { Role } from "@prisma/client";

type AdminSection =
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
  | "developer";

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
  ],
  ORDER_MANAGER: ["dashboard", "orders", "shipping", "analytics"],
  SUPPORT_AGENT: ["dashboard", "inquiries", "customers"],
  USER: [],
};

export function canAccessAdminSection(role: Role, section: AdminSection) {
  return rolePermissions[role]?.includes(section) ?? false;
}

export function getAdminSectionsForRole(role: Role) {
  return rolePermissions[role] ?? [];
}
