import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import { Providers } from "@/components/storefront/Providers";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { defaultStoreInfo, getStoreInfo } from "@/lib/settings";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  let name = SITE_NAME;
  let description = SITE_DESCRIPTION;
  try {
    ({ name, description } = await getStoreInfo());
  } catch {
    ({ name, description } = defaultStoreInfo());
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: name,
      title: name,
      description,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
