import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCta } from "@/components/StickyCta";
import { brand } from "@/lib/brand";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Studio marketplace`,
    template: `%s · ${brand.name}`,
  },
  description:
    "Polite, conversion-led marketplace for Shopify, Salesforce, mobile, web, AI automation, and daily collaboration with Arsalan Arshad.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: `${brand.name} Studio`,
    title: `${brand.name} — Studio marketplace`,
    description:
      "Inquire, chat daily, ship. Shopify apps, Salesforce packages, mobile & web — sole builder marketplace.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Studio marketplace`,
    description:
      "Conversion-led studio marketplace at arsalandev.studio — inquire and ship with Arsalan Arshad.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg font-[family-name:var(--font-body)] text-ink antialiased">
        <GoogleAnalytics />
        <Providers>
          <SiteHeader />
          <main className="flex-1 pb-24 md:pb-8">{children}</main>
          <SiteFooter />
          <StickyCta />
        </Providers>
      </body>
    </html>
  );
}
