import { db } from "@/lib/db";
import { ProductStatus } from "@prisma/client";

export type CommerceLineInput = {
  productId: string;
  quantity: number;
  variantId?: string | null;
};

export type ValidatedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export async function validateCartLines(lines: CommerceLineInput[]) {
  if (!lines.length) throw new Error("CART_EMPTY");
  if (lines.some((line) => !Number.isInteger(line.quantity) || line.quantity < 1)) {
    throw new Error("INVALID_QUANTITY");
  }

  const products = await db.product.findMany({
    where: { id: { in: lines.map((line) => line.productId) } },
    include: { variants: { where: { active: true } } },
  });

  const byId = new Map(products.map((product) => [product.id, product]));
  const validated: ValidatedLine[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.status !== ProductStatus.PUBLISHED || !product.published) throw new Error("PRODUCT_UNAVAILABLE");

    const variant = line.variantId ? product.variants.find((item) => item.id === line.variantId) : null;
    if (line.variantId && !variant) throw new Error("VARIANT_NOT_FOUND");

    const stock = variant ? variant.stock : product.stock;
    if (stock < line.quantity) throw new Error("INSUFFICIENT_STOCK");

    const unitPrice = variant?.price ?? product.price;
    validated.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      sku: variant?.sku ?? product.sku,
      quantity: line.quantity,
      unitPrice,
      total: unitPrice * line.quantity,
    });
  }

  return validated;
}

export function calculateSubtotal(lines: ValidatedLine[]) {
  return lines.reduce((sum, line) => sum + line.total, 0);
}
