import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteUrl, site } from "@/lib/site";

import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Camisetas diseñadas en Colombia`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — Camisetas diseñadas en Colombia`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Camisetas diseñadas en Colombia`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
