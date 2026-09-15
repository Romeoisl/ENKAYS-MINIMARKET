import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { recordAnalytics } from "@/lib/storefront";
export const runtime = "nodejs";
const schema = z.object({ productId: z.string().cuid(), customerId: z.string().cuid().optional(), rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).optional(), content: z.string().trim().min(10).max(3000) });
export async function POST(request: NextRequest) { try { const body = schema.parse(await request.json()); const product = await db.product.findUnique({ where: { id: body.productId }, select: { id: true, published: true } }); if (!product?.published) throw new ApiError("NOT_FOUND", "Product not found", 404); const review = await db.review.create({ data: { productId: body.productId, customerId: body.customerId, rating: body.rating, title: body.title, content: body.content } }); await recordAnalytics("REVIEW_SUBMITTED", { productId: body.productId, customerId: body.customerId }); return apiSuccess(review); } catch (e) { return apiError(e); } }
