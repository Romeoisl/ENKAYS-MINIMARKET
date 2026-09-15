import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { recordAnalytics } from "@/lib/analytics";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  type: z.enum(["PRODUCT_VIEW", "SEARCH", "SEARCH_RESULT_CLICK", "WISHLIST_ADD", "WISHLIST_REMOVE", "WHATSAPP_CLICK", "CONTACT_CLICK", "PROMOTION_CLICK", "BANNER_CLICK", "REVIEW_SUBMITTED"]),
  productId: z.string().cuid().optional(),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`analytics:${getClientIp(request)}`, 120, 60 * 1000);
    if (!rate.allowed) {
      const response = apiSuccess({ recorded: false });
      response.headers.set("Retry-After", String(rate.retryAfterSeconds ?? 60));
      response.headers.set("X-RateLimit-Remaining", "0");
      return response;
    }

    const body = schema.parse(await request.json());
    if (body.productId) {
      const product = await db.product.findFirst({ where: { id: body.productId, published: true }, select: { id: true } });
      if (!product) return apiSuccess({ recorded: false });
    }
    await recordAnalytics(body.type, { productId: body.productId, sessionId: body.sessionId, metadata: body.metadata });
    const response = apiSuccess({ recorded: true });
    response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
