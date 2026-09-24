import { NextRequest } from "next/server";
import { ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { apiError, apiSuccess, requestId } from "@/lib/api";
import { productQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const id = requestId();
  try {
    const parsed = productQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
    if (!parsed.success) return apiError(parsed.error, id);

    const { page, limit, q, categoryId, brandId, featured } = parsed.data;
    const where = {
      published: true,
      status: { in: [ProductStatus.PUBLISHED, ProductStatus.OUT_OF_STOCK, ProductStatus.COMING_SOON] },
      ...(categoryId ? { categoryId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(featured !== undefined ? { featured } : {}),
      ...(q ? { OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { sku: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { shortDescription: { contains: q, mode: "insensitive" as const } },
      ] } : {}),
    };

    const [items, total] = await db.$transaction([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { position: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          variants: { where: { active: true }, orderBy: { createdAt: "asc" } },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const data = items.map(({ reviews, ...product }) => ({
      ...product,
      rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
      reviewCount: reviews.length,
    }));

    return apiSuccess(data, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    return apiError(error, id);
  }
}
