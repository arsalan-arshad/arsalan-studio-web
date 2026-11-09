import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "@/components/GoogleTagManager";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCta } from "@/components/StickyCta";
import { brand } from "@/lib/brand";
import { buildStudioJsonLd, defaultOgImage, getSiteUrl } from "@/lib/seo";
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

const siteUrl = getSiteUrl();

const description =
  "Independent sole-builder studio for Shopify, Salesforce, React Native mobile, web, and AI automation — remote-friendly collaboration with Arsalan Arshad.";

const ogImage = defaultOgImage();

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Studio marketplace`,
    template: `%s · ${brand.name}`,
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: `${brand.name} Studio`,
  authors: [{ name: brand.name, url: siteUrl }],
  creator: brand.name,
  publisher: `${brand.name} Studio`,
  keywords: [
    "Arsalan Arshad",
    "Shopify developer",
    "Salesforce developer",
    "React Native developer",
    "independent software studio",
    "remote software engineer",
    "studio marketplace",
    "Next.js",
    "AI automation",
    "Digitize Turf",
    brand.domain,
  ],
  alternates: {
    canonical: "/",
  },
  category: "technology",
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
    title: `${brand.name} — Independent studio marketplace`,
    description:
      "Sole builder for Shopify, Salesforce, React Native, web, and AI. Inquire, chat daily, ship — arsalandev.studio.",
    images: [
      {
        url: ogImage.url,
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt,
      },
    ],
  },
  twitter: {
    // Square brand mark — summary fits better than a fabricated wide OG art.
    card: "summary",
    title: `${brand.name} — Independent studio marketplace`,
    description:
      "Remote-friendly sole-builder studio at arsalandev.studio — Shopify, Salesforce, mobile, web, AI.",
    images: {
      url: ogImage.url,
      alt: ogImage.alt,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildStudioJsonLd();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg font-[family-name:var(--font-body)] text-ink antialiased">
        <GoogleTagManagerNoscript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleTagManager />
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
