import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { ApiError, apiError, apiSuccess } from "@/lib/api";

export const runtime = "nodejs";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
}).refine((value) => value.status !== undefined || value.paymentStatus !== undefined, { message: "At least one status is required" });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("ADMIN");
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return apiError(new ApiError("NOT_FOUND", "Order not found", 404));
    const order = await db.order.update({ where: { id }, data: body });
    await db.auditLog.create({ data: { userId: actor.id, action: "UPDATE", resource: "Order", resourceId: id, metadata: body } });
    return apiSuccess(order);
  } catch (error) {
    return apiError(error);
  }
}
