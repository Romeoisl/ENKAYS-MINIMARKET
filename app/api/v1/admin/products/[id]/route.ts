import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { productSchema } from "@/lib/validations";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    await requireRole("EDITOR");
    const { id: productId } = await params;
    const product = await db.product.findUnique({ where: { id: productId }, include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { createdAt: "asc" } }, category: true, brand: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);
    return NextResponse.json({ data: product, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const { id: productId } = await params;
    const body = productSchema.parse(await request.json());
    const existing = await db.product.findUnique({ where: { id: productId } });
    if (!existing) throw new ApiError("NOT_FOUND", "Product not found", 404);
    const status = body.status;
    if (body.categoryId && body.brandId) {
      const assignment = await db.categoryBrand.findUnique({ where: { categoryId_brandId: { categoryId: body.categoryId, brandId: body.brandId } } });
      if (!assignment) throw new ApiError("INVALID_BRAND_CATEGORY", "The selected brand is not assigned to this category.", 400);
    }
    const product = await db.product.update({ where: { id: productId }, data: { ...body, status, published: status !== "DRAFT" } });
    await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", resource: "Product", resourceId: product.id, metadata: { name: product.name, status } } });
    return NextResponse.json({ data: product, requestId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return NextResponse.json({ error: { code: "DUPLICATE", message: "A product with this slug or SKU already exists." }, requestId: id }, { status: 409 });
      if (error.code === "P2003") return NextResponse.json({ error: { code: "INVALID_REFERENCE", message: "The selected category or brand no longer exists." }, requestId: id }, { status: 400 });
    }
    return apiError(error, id);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("ADMIN");
    const { id: productId } = await params;
    const existing = await db.product.findUnique({ where: { id: productId }, select: { id: true, name: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Product not found", 404);
    await db.product.update({ where: { id: productId }, data: { status: "ARCHIVED", published: false } });
    await db.auditLog.create({ data: { userId: user.id, action: "ARCHIVE", resource: "Product", resourceId: productId, metadata: { name: existing.name } } });
    return NextResponse.json({ data: { success: true }, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}
