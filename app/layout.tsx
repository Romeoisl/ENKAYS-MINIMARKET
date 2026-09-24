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
  description: BRAND_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
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
    images: [`${SITE_URL}/opengraph-image`],
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
