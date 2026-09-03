import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Shop Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop products at ENKAYS MINI-MARKETPLACE. Discover great products, browse categories, and order conveniently online or through WhatsApp.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
