import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Account access");

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
