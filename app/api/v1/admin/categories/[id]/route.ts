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
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  active: z.boolean().optional(),
  position: z.number().int().min(0).max(100000).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const existing = await db.category.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Category not found", 404);
    if (data.parentId === id) throw new ApiError("VALIDATION_ERROR", "A category cannot be its own parent");
    if (data.parentId) {
      const parent = await db.category.findUnique({ where: { id: data.parentId }, select: { id: true } });
      if (!parent) throw new ApiError("NOT_FOUND", "Parent category not found", 404);
    }
    const category = await db.category.update({ where: { id }, data });
    await db.auditLog.create({ data: { userId: actor.id, action: "UPDATE", resource: "Category", resourceId: id, metadata: data } });
    return apiSuccess(category);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const existing = await db.category.findUnique({ where: { id }, select: { id: true, active: true } });
    if (!existing) throw new ApiError("NOT_FOUND", "Category not found", 404);
    const category = await db.category.update({ where: { id }, data: { active: false } });
    await db.auditLog.create({ data: { userId: actor.id, action: "DEACTIVATE", resource: "Category", resourceId: id, metadata: { previousActive: existing.active } } });
    return apiSuccess(category);
  } catch (error) {
    return apiError(error);
  }
}
