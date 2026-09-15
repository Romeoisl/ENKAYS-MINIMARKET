import { db } from "@/lib/db";
import type { AnalyticsEventType } from "@prisma/client";

export async function recordAnalytics(type: AnalyticsEventType, data: { productId?: string; customerId?: string; sessionId?: string; metadata?: unknown } = {}) {
  return db.analyticsEvent.create({
    data: {
      type,
      productId: data.productId,
      customerId: data.customerId,
      sessionId: data.sessionId,
      metadata: data.metadata as never,
    },
  });
}
