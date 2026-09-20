import { NextRequest, NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { productQuerySchema, productSchema } from "@/lib/validations";
import { apiError, requestId } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const id = requestId();
  try {
    await requireRole("EDITOR");
    const parsed = productQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      status: { not: ProductStatus.ARCHIVED },
      ...(parsed.q ? { OR: [
        { name: { contains: parsed.q, mode: "insensitive" as const } },
        { sku: { contains: parsed.q, mode: "insensitive" as const } },
      ] } : {}),
      ...(parsed.categoryId ? { categoryId: parsed.categoryId } : {}),
      ...(parsed.brandId ? { brandId: parsed.brandId } : {}),
      ...(parsed.featured !== undefined ? { featured: parsed.featured } : {}),
    };
    const [items, total] = await db.$transaction([
      db.product.findMany({
        where,
        include: { images: { orderBy: { position: "asc" }, take: 1 }, category: { select: { name: true } }, brand: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      db.product.count({ where }),
    ]);
    return NextResponse.json({ data: items, meta: { page: parsed.page, limit: parsed.limit, total, pages: Math.ceil(total / parsed.limit) }, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}

export async function POST(request: NextRequest) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const body = productSchema.parse(await request.json());
    const status = body.status === "DRAFT" ? "DRAFT" : body.status;
    const product = await db.product.create({ data: { ...body, status, published: status !== "DRAFT" } });
    await db.auditLog.create({ data: { userId: user.id, action: "CREATE", resource: "Product", resourceId: product.id, metadata: { name: product.name, status } } });
    return NextResponse.json({ data: product, requestId: id }, { status: 201 });
  } catch (error) {
    return apiError(error, id);
  }
}
