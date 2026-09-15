import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api";
import { recordAnalytics } from "@/lib/storefront";
export const runtime = "nodejs";
export async function GET(request: NextRequest) { try { const customerId = request.headers.get("x-customer-id"); if (!customerId) return apiSuccess([]); return apiSuccess(await db.wishlistItem.findMany({ where: { customerId }, include: { product: { include: { images: { orderBy: { position: "asc" } } } } }, orderBy: { createdAt: "desc" } })); } catch (e) { return apiError(e); } }
export async function POST(request: NextRequest) { try { const customerId = z.string().cuid().parse(request.headers.get("x-customer-id")); const { productId } = z.object({ productId: z.string().cuid() }).parse(await request.json()); const item = await db.wishlistItem.upsert({ where: { customerId_productId: { customerId, productId } }, update: {}, create: { customerId, productId }, include: { product: true } }); await recordAnalytics("WISHLIST_ADD", { customerId, productId }); return apiSuccess(item); } catch (e) { return apiError(e); } }
export async function DELETE(request: NextRequest) { try { const customerId = z.string().cuid().parse(request.headers.get("x-customer-id")); const productId = z.string().cuid().parse(new URL(request.url).searchParams.get("productId")); await db.wishlistItem.delete({ where: { customerId_productId: { customerId, productId } } }); await recordAnalytics("WISHLIST_REMOVE", { customerId, productId }); return apiSuccess({ removed: true }); } catch (e) { return apiError(e); } }
