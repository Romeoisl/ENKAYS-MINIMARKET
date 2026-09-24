import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { BRAND_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SITE_URL = "https://enkays-foods-and-more.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Enkays Foods & More | Nigerian Foodstuff",
    template: "%s | Enkays Foods & More",
  },
  description:
    "Enkays Foods & More is a Nigerian foodstuff marketplace for quality everyday essentials — rice, beans, garri, grains, cooking oils, flour, spices, seafood, meat, poultry and pantry favourites. Browse products and order directly through WhatsApp or phone.",

  keywords: ["foodstuff", "groceries", "food store", "Nigeria", "Enkays Foods", "rice", "beans", "garri", "grains", "pantry essentials"],
  openGraph: {
    siteName: "Enkays Foods & More",
    type: "website",
    title: "Enkays Foods & More | Nigerian Foodstuff",
    description:
      "Enkays Foods & More is a Nigerian foodstuff marketplace for quality everyday essentials — rice, beans, garri, grains, cooking oils, flour, spices, seafood, meat, poultry and pantry favourites. Browse products and order directly through WhatsApp or phone.",

    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Enkays Foods & More — Quality foodstuff and everyday essentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkays Foods & More | Nigerian Foodstuff",
    description:
      "Quality Nigerian foodstuff and everyday essentials. Browse the store and order directly through WhatsApp or phone.",
    images: ["/opengraph-image"],
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
