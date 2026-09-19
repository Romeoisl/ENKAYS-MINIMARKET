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
  description: "Grains, beans, garri, flour, oils, spices and pantry staples. Order by WhatsApp or phone call.",
  keywords: ["foodstuff", "groceries", "food store", "Nigeria", "Enkays Foods", "rice", "beans", "garri", "grains", "pantry essentials"],
  openGraph: {
    siteName: "Enkays Foods & More",
    type: "website",
    title: "Enkays Foods & More | Nigerian Foodstuff",
    description: "Grains, beans, garri, flour, oils, spices and pantry staples. Order by WhatsApp or phone call.",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
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
