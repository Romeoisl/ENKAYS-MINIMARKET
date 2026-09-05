import { db } from "@/lib/db";

export type WhatsAppProduct = {
  name: string;
  price?: number;
  sku?: string;
  url?: string;
  quantity?: number;
  variant?: string;
};

function normalizeNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export async function getWhatsAppNumber() {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings?.whatsappNumber) throw new Error("WHATSAPP_NOT_CONFIGURED");
  return normalizeNumber(settings.whatsappNumber);
}

export async function buildProductWhatsAppUrl(product: WhatsAppProduct) {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings?.whatsappNumber) throw new Error("WHATSAPP_NOT_CONFIGURED");

  const lines = [
    "Hello, I’m interested in ordering from ENKAYS MINI-MARKETPLACE.",
    "",
    `Product: ${product.name}`,
  ];
  if (product.quantity) lines.push(`Quantity: ${product.quantity}`);
  if (product.variant) lines.push(`Variant: ${product.variant}`);
  if (settings.includePriceInWhatsApp && product.price !== undefined) lines.push(`Price: ₦${product.price.toLocaleString("en-NG")}`);
  if (settings.includeSkuInWhatsApp && product.sku) lines.push(`SKU: ${product.sku}`);
  if (settings.includeProductUrlInWhatsApp && product.url) lines.push(`Product page: ${product.url}`);
  lines.push("", "Is this item still available?");

  return `https://wa.me/${normalizeNumber(settings.whatsappNumber)}?text=${encodeURIComponent(lines.join("\n"))}`;
}
