import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { recordAnalytics } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
const COOKIE = "enkays_wishlist";

function session(request: NextRequest) { return request.cookies.get(COOKIE)?.value ?? randomUUID(); }
function withSession(response: NextResponse, id: string) {
  if (!response.cookies.get(COOKIE)) response.cookies.set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 180 });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const guestSessionId = session(request);
    const items = await db.wishlistItem.findMany({ where: { guestSessionId, product: { published: true, status: { in: ["PUBLISHED", "OUT_OF_STOCK", "COMING_SOON"] } } }, include: { product: { include: { images: { orderBy: { position: "asc" } } } } }, orderBy: { createdAt: "desc" } });
    return withSession(apiSuccess(items), guestSessionId);
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`wishlist:${getClientIp(request)}`, 60, 60 * 1000);
    if (!rate.allowed) {
      const response = apiSuccess({ updated: false });
      response.headers.set("Retry-After", String(rate.retryAfterSeconds ?? 60));
      return response;
    }
    const guestSessionId = session(request);
    const { productId } = z.object({ productId: z.string().cuid() }).parse(await request.json());
    const product = await db.product.findFirst({ where: { id: productId, published: true, status: { in: ["PUBLISHED", "OUT_OF_STOCK", "COMING_SOON"] } }, select: { id: true } });
    if (!product) throw new ApiError("NOT_FOUND", "Product not found", 404);
    const existing = await db.wishlistItem.findFirst({ where: { guestSessionId, productId } });
    const item = existing ?? await db.wishlistItem.create({ data: { guestSessionId, productId }, include: { product: true } });
    await recordAnalytics("WISHLIST_ADD", { productId, sessionId: guestSessionId });
    return withSession(apiSuccess(item), guestSessionId);
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rate = checkRateLimit(`wishlist:${getClientIp(request)}`, 60, 60 * 1000);
    if (!rate.allowed) {
      const response = apiSuccess({ removed: false });
      response.headers.set("Retry-After", String(rate.retryAfterSeconds ?? 60));
      return response;
    }
    const guestSessionId = session(request);
    const productId = z.string().cuid().parse(new URL(request.url).searchParams.get("productId"));
    await db.wishlistItem.deleteMany({ where: { guestSessionId, productId } });
    await recordAnalytics("WISHLIST_REMOVE", { productId, sessionId: guestSessionId });
    return withSession(apiSuccess({ removed: true }), guestSessionId);
  } catch (error) { return apiError(error); }
}
