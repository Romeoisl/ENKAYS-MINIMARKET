import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prices are stored in kobo (smallest NGN unit) to avoid floating point
 * errors. This formats kobo -> a display string like "₦45,000".
 */
export function formatPrice(kobo: number, currency: string = "NGN") {
  const amount = kobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function stockLabel(stock: number): {
  label: string;
  tone: "in-stock" | "low-stock" | "out-of-stock";
} {
  if (stock <= 0) return { label: "Out of stock", tone: "out-of-stock" };
  if (stock <= 5) return { label: `Low stock — ${stock} left`, tone: "low-stock" };
  return { label: "In stock", tone: "in-stock" };
}

/**
 * Builds a WhatsApp deep link for a single product enquiry.
 * Respects site settings for what to include in the message.
 */
export function buildProductWhatsAppLink(params: {
  whatsappNumber: string;
  siteName: string;
  productName: string;
  price?: number | null;
  sku?: string;
  productUrl?: string;
  includePrice?: boolean;
  includeSku?: boolean;
  includeUrl?: boolean;
}) {
  const {
    whatsappNumber,
    siteName,
    productName,
    price,
    sku,
    productUrl,
    includePrice = true,
    includeSku = true,
    includeUrl = true,
  } = params;

  const lines = [
    `Hello, I'm interested in ordering from ${siteName}.`,
    "",
    `Product: ${productName}`,
  ];
  if (includePrice && price != null) lines.push(`Price: ${formatPrice(price)}`);
  if (includeSku && sku) lines.push(`SKU: ${sku}`);
  if (includeUrl && productUrl) lines.push(`Product page: ${productUrl}`);
  lines.push("", "Is this item still available?");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}
