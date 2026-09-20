import { NextRequest, NextResponse } from "next/server";
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
    const product = await db.product.update({ where: { id: productId }, data: { ...body, status, published: status !== "DRAFT" } });
    await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", resource: "Product", resourceId: product.id, metadata: { name: product.name, status } } });
    return NextResponse.json({ data: product, requestId: id });
  } catch (error) {
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
