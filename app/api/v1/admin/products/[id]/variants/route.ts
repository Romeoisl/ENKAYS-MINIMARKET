import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { variantSchema } from "@/lib/validations";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    await requireRole("EDITOR");
    const { id: productId } = await params;
    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);
    const variants = await db.productVariant.findMany({ where: { productId }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ data: variants, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const { id: productId } = await params;
    const body = variantSchema.parse(await request.json());
    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);
    const variant = await db.productVariant.create({ data: { productId, ...body } });
    await db.auditLog.create({ data: { userId: user.id, action: "CREATE", resource: "ProductVariant", resourceId: variant.id, metadata: { productId, name: variant.name, value: variant.value } } });
    return NextResponse.json({ data: variant, requestId: id }, { status: 201 });
  } catch (error) {
    return apiError(error, id);
  }
}
