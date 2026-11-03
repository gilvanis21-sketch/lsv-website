import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} (LSV)`, template: `%s | ${SITE.short}` },
  description: SITE.description,
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE.name },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
