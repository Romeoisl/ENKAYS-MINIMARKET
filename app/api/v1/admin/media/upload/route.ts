import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadMedia } from "@/lib/cloudinary";
import { requireRole } from "@/lib/permissions";
import { apiError, requestId, ApiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: NextRequest) {
  const id = requestId();
  try {
    const user = await requireRole("EDITOR");
    const form = await request.formData();
    const file = form.get("file");
    const productId = form.get("productId");
    if (!(file instanceof File)) throw new ApiError("FILE_REQUIRED", "An image file is required", 400);
    if (!ALLOWED.has(file.type)) throw new ApiError("UNSUPPORTED_FILE", "Only JPEG, PNG, WebP and AVIF images are supported", 415);
    if (file.size > MAX_BYTES) throw new ApiError("FILE_TOO_LARGE", "Image must be 8 MB or smaller", 413);
    if (typeof productId !== "string" || !productId) throw new ApiError("PRODUCT_REQUIRED", "Product ID is required", 400);

    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);

    const uploaded = await uploadMedia(Buffer.from(await file.arrayBuffer()), `enkays/products/${productId}`);
    const last = await db.productImage.findFirst({ where: { productId }, orderBy: { position: "desc" }, select: { position: true } });
    const image = await db.productImage.create({ data: { productId, publicId: uploaded.publicId, url: uploaded.url, secureUrl: uploaded.secureUrl, width: uploaded.width, height: uploaded.height, format: uploaded.format, bytes: uploaded.bytes, position: (last?.position ?? -1) + 1 } });
    await db.auditLog.create({ data: { userId: user.id, action: "UPLOAD", resource: "ProductImage", resourceId: image.id, metadata: { productId, publicId: uploaded.publicId } } });
    return NextResponse.json({ data: image, requestId: id }, { status: 201 });
  } catch (error) {
    return apiError(error, id);
  }
}
