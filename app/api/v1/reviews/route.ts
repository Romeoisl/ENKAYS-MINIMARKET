import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { recordAnalytics } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
const COOKIE = "enkays_review_session";
const schema = z.object({ productId: z.string().cuid(), rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).optional(), content: z.string().trim().min(10).max(3000) });

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`review:${getClientIp(request)}`, 5, 10 * 60 * 1000);
    if (!rate.allowed) {
      const response = apiSuccess({ submitted: false, message: "Too many review attempts. Please try again later." });
      response.headers.set("Retry-After", String(rate.retryAfterSeconds ?? 600));
      return response;
    }

    const body = schema.parse(await request.json());
    const product = await db.product.findFirst({ where: { id: body.productId, published: true }, select: { id: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);
    const sessionId = request.cookies.get(COOKIE)?.value ?? randomUUID();
    const review = await db.review.create({ data: { productId: body.productId, rating: body.rating, title: body.title, content: body.content, status: "PENDING" } });
    await recordAnalytics("REVIEW_SUBMITTED", { productId: body.productId, sessionId });
    const response = apiSuccess(review);
    response.cookies.set(COOKIE, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 180 });
    return response;
  } catch (error) { return apiError(error); }
}
