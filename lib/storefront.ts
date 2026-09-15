import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const GUEST_COOKIE = "enkays_session";

export async function getGuestSession() {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value ?? randomUUID();
}

export async function getOrCreateCart(sessionId: string) {
  return db.cart.upsert({ where: { guestSessionId: sessionId }, update: {}, create: { guestSessionId: sessionId }, include: { items: { include: { product: { include: { images: { orderBy: { position: "asc" } }, variants: true } }, variant: true } } } });
}

export async function recordAnalytics(type: Parameters<typeof db.analyticsEvent.create>[0]["data"]["type"], data: { productId?: string; customerId?: string; sessionId?: string; metadata?: unknown } = {}) {
  return db.analyticsEvent.create({ data: { type, productId: data.productId, customerId: data.customerId, sessionId: data.sessionId, metadata: data.metadata as never } });
}

export function calculateDiscount(subtotal: number, coupon?: { type: "PERCENTAGE" | "FIXED"; value: number }) {
  if (!coupon || subtotal <= 0) return 0;
  return coupon.type === "PERCENTAGE" ? Math.min(subtotal, Math.floor(subtotal * coupon.value / 100)) : Math.min(subtotal, coupon.value);
}

export function sessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 180 };
}
