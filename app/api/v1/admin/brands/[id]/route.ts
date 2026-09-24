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
  categoryIds: z.array(z.string().cuid()).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const { categoryIds, ...brandData } = data;
    const brand = await db.$transaction(async (tx) => {
      const existing = await tx.brand.findUnique({ where: { id }, select: { id: true } });
      if (!existing) throw new ApiError("NOT_FOUND", "Brand not found", 404);
      const updated = await tx.brand.update({ where: { id }, data: brandData });
      if (categoryIds !== undefined) {
        await tx.categoryBrand.deleteMany({ where: { brandId: id } });
        if (categoryIds.length) await tx.categoryBrand.createMany({
          data: categoryIds.map((categoryId) => ({ categoryId, brandId: id })),
          skipDuplicates: true,
        });
      }
      await tx.auditLog.create({
        data: { userId: actor.id, action: "UPDATE", resource: "Brand", resourceId: id, metadata: { name: updated.name, slug: updated.slug, categoryIds: categoryIds ?? undefined } },
      });
      return updated;
    });
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
