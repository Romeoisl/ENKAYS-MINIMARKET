import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const existing = await db.brand.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Brand not found", 404);
    const brand = await db.brand.update({ where: { id }, data });
    await db.auditLog.create({ data: { userId: actor.id, action: "UPDATE", resource: "Brand", resourceId: id, metadata: data } });
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const existing = await db.brand.findUnique({ where: { id }, select: { id: true, active: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Brand not found", 404);
    const brand = await db.brand.update({ where: { id }, data: { active: false } });
    await db.auditLog.create({ data: { userId: actor.id, action: "DEACTIVATE", resource: "Brand", resourceId: id, metadata: { previousActive: existing.active } } });
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error);
  }
}
