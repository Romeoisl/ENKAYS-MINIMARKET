import { z } from "zod";

export const authLoginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });

export const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().length(3).default("NGN"),
  sku: z.string().trim().min(1).max(80),
  stock: z.number().int().nonnegative(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().cuid().optional().nullable(),
  brandId: z.string().cuid().optional().nullable(),
  salesMethod: z.enum(["WHATSAPP", "CONTACT", "PHONE", "CHECKOUT", "DISABLED"]).default("WHATSAPP"),
  priceVisibility: z.enum(["SHOW_PRICE", "CONTACT_FOR_PRICE"]).default("SHOW_PRICE"),
});

export const productQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(24), q: z.string().trim().max(180).optional(), categoryId: z.string().cuid().optional(), brandId: z.string().cuid().optional(), featured: z.coerce.boolean().optional() });
export const categorySchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(1000).optional().nullable(), parentId: z.string().cuid().optional().nullable(), active: z.boolean().default(true), position: z.number().int().nonnegative().default(0) });
export const brandSchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(1000).optional().nullable(), active: z.boolean().default(true) });
export const variantSchema = z.object({ name: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(120), sku: z.string().trim().max(80).optional().nullable(), price: z.number().int().nonnegative().optional().nullable(), stock: z.number().int().nonnegative(), active: z.boolean().default(true), options: z.record(z.string(), z.string()).optional() });
export const orderSchema = z.object({ customerName: z.string().trim().min(2).max(160), customerEmail: z.string().email().max(254).optional().nullable(), customerPhone: z.string().trim().min(7).max(30), deliveryMethod: z.string().trim().max(80).optional().nullable(), deliveryAddress: z.string().trim().max(1000).optional().nullable(), notes: z.string().trim().max(2000).optional().nullable() });
export const reviewSchema = z.object({ productId: z.string().cuid(), rating: z.number().int().min(1).max(5), title: z.string().trim().max(160).optional().nullable(), content: z.string().trim().min(5).max(5000) });
export const promotionSchema = z.object({ name: z.string().trim().min(2).max(160), type: z.enum(["PERCENTAGE", "FIXED"]), value: z.number().int().positive(), minOrder: z.number().int().nonnegative().optional().nullable(), startsAt: z.coerce.date(), endsAt: z.coerce.date(), active: z.boolean().default(true) }).refine((v) => v.endsAt > v.startsAt, { message: "Promotion end must be after start" });
export const couponSchema = z.object({ code: z.string().trim().min(3).max(40).toUpperCase(), type: z.enum(["PERCENTAGE", "FIXED"]), value: z.number().int().positive(), minimumOrder: z.number().int().nonnegative().optional().nullable(), expiresAt: z.coerce.date().optional().nullable(), usageLimit: z.number().int().positive().optional().nullable(), perCustomerLimit: z.number().int().positive().optional().nullable(), active: z.boolean().default(true) });
export const deliverySchema = z.object({ state: z.string().trim().min(2).max(100), city: z.string().trim().min(2).max(100), zone: z.string().trim().max(120).optional().nullable(), fee: z.number().int().nonnegative(), estimatedDelivery: z.string().trim().max(160).optional().nullable(), freeDeliveryThreshold: z.number().int().nonnegative().optional().nullable(), pickup: z.boolean().default(false), active: z.boolean().default(true) });
export const settingsSchema = z.object({ siteName: z.string().trim().min(1).max(160), currency: z.string().length(3), whatsappNumber: z.string().trim().max(30).optional().nullable(), phoneNumber: z.string().trim().max(30).optional().nullable(), supportEmail: z.string().email().optional().nullable(), defaultWhatsAppMessage: z.string().max(2000).optional().nullable(), includePriceInWhatsApp: z.boolean(), includeSkuInWhatsApp: z.boolean(), includeProductUrlInWhatsApp: z.boolean(), seoTitle: z.string().max(180).optional().nullable(), seoDescription: z.string().max(320).optional().nullable(), orderPrefix: z.string().trim().min(1).max(10) });
export type ProductInput = z.infer<typeof productSchema>;
