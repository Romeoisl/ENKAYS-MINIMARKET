import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { BRAND_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: ["foodstuff", "groceries", "food store", "Nigeria", "Enkays Foods", "rice", "beans", "grains", "pantry essentials"],
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    title: SITE_NAME,
    description: BRAND_DESCRIPTION,
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
