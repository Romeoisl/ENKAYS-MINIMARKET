import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { recordAnalytics } from "@/lib/storefront";
export const runtime = "nodejs";
const schema = z.object({ type: z.enum(["PRODUCT_VIEW","SEARCH","SEARCH_RESULT_CLICK","ADD_TO_CART","REMOVE_FROM_CART","WISHLIST_ADD","WISHLIST_REMOVE","CHECKOUT_STARTED","WHATSAPP_CLICK","CONTACT_CLICK","PROMOTION_CLICK","BANNER_CLICK","REVIEW_SUBMITTED"]), productId: z.string().cuid().optional(), sessionId: z.string().max(100).optional(), metadata: z.record(z.unknown()).optional() });
export async function POST(request: NextRequest) { try { const body = schema.parse(await request.json()); await recordAnalytics(body.type, { productId: body.productId, sessionId: body.sessionId, metadata: body.metadata }); return apiSuccess({ recorded: true }); } catch (e) { return apiError(e); } }
