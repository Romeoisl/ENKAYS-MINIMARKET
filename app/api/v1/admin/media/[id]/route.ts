import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteMedia } from "@/lib/cloudinary";
import { requireRole } from "@/lib/permissions";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const { id: imageId } = await params;
    const image = await db.productImage.findUnique({ where: { id: imageId }, select: { id: true, productId: true, publicId: true } });
    if (!image) throw new ApiError("NOT_FOUND", "Image not found", 404);
    await deleteMedia(image.publicId);
    await db.productImage.delete({ where: { id: image.id } });
    await db.auditLog.create({ data: { userId: user.id, action: "DELETE", resource: "ProductImage", resourceId: image.id, metadata: { productId: image.productId, publicId: image.publicId } } });
    return NextResponse.json({ data: { success: true }, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}
