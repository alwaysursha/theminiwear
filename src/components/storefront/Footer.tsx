import Link from "next/link";
import { NewsletterForm } from "@/components/storefront/NewsletterForm";
import { SiteLogo } from "@/components/storefront/SiteLogo";
import { SITE_NAME } from "@/lib/constants";

const footerLinks = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?new=true", label: "New Arrivals" },
    { href: "/shop?sort=trending", label: "Trending" },
  ],
  Help: [
    { href: "/contact", label: "Contact Us" },
    { href: "/account/orders", label: "Track Order" },
    { href: "/account", label: "My Account" },
  ],
};

type FooterProps = {
  legalLinks?: { href: string; label: string }[];
};

export function Footer({ legalLinks = [] }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#967BB6] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex flex-col items-start gap-0.5">
              <Link
                href="/"
                className="shrink-0 transition-opacity hover:opacity-90"
              >
                <SiteLogo variant="footer" />
              </Link>
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                Adorable, comfortable kids clothing for every adventure. Soft
                fabrics, playful prints, and sizes for growing explorers.
              </p>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-mint">
                Join our newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-mint">
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          {legalLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/50">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
