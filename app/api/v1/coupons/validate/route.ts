import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { calculateDiscount } from "@/lib/storefront";
export const runtime = "nodejs";
export async function POST(request: NextRequest) { try { const { code, subtotal } = z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().int().nonnegative() }).parse(await request.json()); const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } }); if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) || (coupon.minimumOrder !== null && subtotal < coupon.minimumOrder)) throw new ApiError("INVALID_COUPON", "Coupon is invalid or unavailable", 400); return apiSuccess({ code: coupon.code, type: coupon.type, value: coupon.value, discount: calculateDiscount(subtotal, coupon) }); } catch (e) { return apiError(e); } }
