import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { productSchema } from "@/lib/validations";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const body = productSchema.parse(await request.json());
    const product = await db.product.create({ data: { ...body, status: body.published ? "PUBLISHED" : "DRAFT" } });
    await db.auditLog.create({ data: { userId: user.id, action: "CREATE", resource: "Product", resourceId: product.id, metadata: { name: product.name } } });
    return NextResponse.json({ data: product, requestId: id }, { status: 201 });
  } catch (error) {
    return apiError(error, id);
  }
}
