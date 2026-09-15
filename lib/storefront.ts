import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getGuestSession() {
  const store = await cookies();
  let session = store.get("enkays_session")?.value;
  if (!session) session = randomUUID();
  return session;
}

export async function getOrCreateCart(sessionId: string) {
  return db.cart.upsert({ where: { guestSessionId: sessionId }, update: {}, create: { guestSessionId: sessionId }, include: { items: { include: { product: { include: { images: { orderBy: { position: "asc" } }, variants: true } }, variant: true } } } });
}

export async function recordAnalytics(type: Parameters<typeof db.analyticsEvent.create>[0]["data"]["type"], data: { productId?: string; customerId?: string; sessionId?: string; metadata?: unknown } = {}) {
  return db.analyticsEvent.create({ data: { type, productId: data.productId, customerId: data.customerId, sessionId: data.sessionId, metadata: data.metadata as never } });
}

export function calculateDiscount(subtotal: number, coupon?: { type: "PERCENTAGE" | "FIXED"; value: number }) {
  if (!coupon || subtotal <= 0) return 0;
  return coupon.type === "PERCENTAGE" ? Math.min(subtotal, Math.floor(subtotal * coupon.value / 10000)) : Math.min(subtotal, coupon.value);
}
