import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { recordAnalytics } from "@/lib/analytics";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  type: z.enum(["PRODUCT_VIEW", "SEARCH", "SEARCH_RESULT_CLICK", "WISHLIST_ADD", "WISHLIST_REMOVE", "WHATSAPP_CLICK", "CONTACT_CLICK", "PROMOTION_CLICK", "BANNER_CLICK", "REVIEW_SUBMITTED"]),
  productId: z.string().cuid().optional(),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    if (body.productId) {
      const product = await db.product.findFirst({ where: { id: body.productId, published: true }, select: { id: true } });
      if (!product) return apiSuccess({ recorded: false });
    }
    await recordAnalytics(body.type, { productId: body.productId, sessionId: body.sessionId, metadata: body.metadata });
    return apiSuccess({ recorded: true });
  } catch (error) {
    return apiError(error);
  }
}
