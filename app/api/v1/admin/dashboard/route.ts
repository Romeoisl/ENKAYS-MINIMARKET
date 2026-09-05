import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { apiError, requestId } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const id = requestId();
  try {
    await requireRole("EDITOR");
    const [products, published, lowStock, orders, pendingReviews, customers] = await Promise.all([
      db.product.count({ where: { status: { not: "ARCHIVED" } } }),
      db.product.count({ where: { published: true, status: "PUBLISHED" } }),
      db.product.count({ where: { stock: { gt: 0, lte: 5 }, status: { not: "ARCHIVED" } } }),
      db.order.count(),
      db.review.count({ where: { status: "PENDING" } }),
      db.customer.count(),
    ]);

    const revenue = await db.order.aggregate({
      where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"] }, paymentStatus: "PAID" },
      _sum: { total: true },
    });

    return NextResponse.json({ data: { products, published, lowStock, orders, pendingReviews, customers, revenue: revenue._sum.total ?? 0 }, requestId: id });
  } catch (error) {
    return apiError(error, id);
  }
}
