"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/developer/hero", label: "Hero" },
  { href: "/admin/developer/categories", label: "Categories" },
  { href: "/admin/developer/sections/categories", label: "Category section" },
  { href: "/admin/developer/sections/new-arrivals", label: "New Arrivals" },
  { href: "/admin/developer/sections/on-sale", label: "On Sale" },
  { href: "/admin/developer/sections/clearance", label: "Clearance" },
  { href: "/admin/developer/sections/trending", label: "Trending" },
  { href: "/admin/developer/pages/privacy", label: "Privacy" },
  { href: "/admin/developer/pages/terms", label: "Terms" },
  { href: "/admin/developer/pages/returns", label: "Returns" },
  { href: "/admin/developer/pages/contact", label: "Contact" },
];

export function DeveloperNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            pathname === link.href
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
