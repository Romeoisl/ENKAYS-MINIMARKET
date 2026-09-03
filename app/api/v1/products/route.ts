import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

// GET /api/v1/products?page=1&category=electronics&brand=novatech&q=headphones
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const categorySlug = searchParams.get("category") ?? undefined;
  const brandSlug = searchParams.get("brand") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const where = {
    published: true,
    status: { not: "ARCHIVED" as const },
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { shortDescription: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    data: items,
    meta: {
      page,
      perPage: PRODUCTS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    },
  });
}
