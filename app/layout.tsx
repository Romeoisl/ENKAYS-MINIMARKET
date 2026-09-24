import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { BRAND_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SITE_URL = "https://enkays-foods-and-more.vercel.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Enkays Foods & More | Nigerian Foodstuff",
    template: "%s | Enkays Foods & More",
  },
  description: BRAND_DESCRIPTION,
  keywords: ["foodstuff", "groceries", "food store", "Nigeria", "Enkays Foods", "everyday essentials"],
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    title: "Enkays Foods & More | Nigerian Foodstuff",
    description: BRAND_DESCRIPTION,
    url: SITE_URL,
    images: [{
      url: OG_IMAGE,
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "Enkays Foods & More — Quality foodstuff and everyday essentials",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkays Foods & More | Nigerian Foodstuff",
    description: BRAND_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
