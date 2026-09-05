import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { variantSchema } from "@/lib/validations";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const { id: productId, variantId } = await params;
    const body = variantSchema.parse(await request.json());
    const existing = await db.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!existing) throw new ApiError("NOT_FOUND", "Variant not found", 404);
    const variant = await db.productVariant.update({ where: { id: variantId }, data: body });
    await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", resource: "ProductVariant", resourceId: variant.id, metadata: { productId, name: variant.name, value: variant.value } } });
    return NextResponse.json({ data: variant, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const { id: productId, variantId } = await params;
    const existing = await db.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true, name: true, value: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Variant not found", 404);
    await db.productVariant.delete({ where: { id: variantId } });
    await db.auditLog.create({ data: { userId: user.id, action: "DELETE", resource: "ProductVariant", resourceId: variantId, metadata: { productId, name: existing.name, value: existing.value } } });
    return NextResponse.json({ data: { success: true }, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}
