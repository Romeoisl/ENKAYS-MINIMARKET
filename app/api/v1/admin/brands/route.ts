import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export const runtime = "nodejs";

const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  active: z.boolean().default(true),
  categoryIds: z.array(z.string().cuid()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole("EDITOR");
    const categoryId = request.nextUrl.searchParams.get("categoryId");
    if (categoryId) {
      const brands = await db.brand.findMany({
        where: {
          active: true,
          categoryAssignments: { some: { categoryId } },
        },
        orderBy: { name: "asc" },
      });
      return apiSuccess(brands);
    }
    const brands = await db.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
    return apiSuccess(brands);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole("EDITOR");
    const data = brandSchema.parse(await request.json());
    const { categoryIds, ...brandData } = data;
    const brand = await db.$transaction(async (tx) => {
      const created = await tx.brand.create({ data: brandData });
      if (categoryIds.length) await tx.categoryBrand.createMany({ data: categoryIds.map((categoryId) => ({ categoryId, brandId: created.id })), skipDuplicates: true });
      await tx.auditLog.create({ data: { userId: actor.id, action: "CREATE", resource: "Brand", resourceId: created.id, metadata: { name: created.name, slug: created.slug } } });
      return created;
    });
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const data = brandSchema.parse(await request.json());
    const { categoryIds, ...brandData } = data;
    const brand = await db.$transaction(async (tx) => {
      const existing = await tx.brand.findUnique({ where: { id }, select: { id: true } });
      if (!existing) throw new ApiError("NOT_FOUND", "Brand not found", 404);
      const updated = await tx.brand.update({ where: { id }, data: brandData });
      await tx.categoryBrand.deleteMany({ where: { brandId: id } });
      if (categoryIds.length) await tx.categoryBrand.createMany({ data: categoryIds.map((categoryId) => ({ categoryId, brandId: id })), skipDuplicates: true });
      await tx.auditLog.create({ data: { userId: actor.id, action: "UPDATE", resource: "Brand", resourceId: id, metadata: { name: updated.name, slug: updated.slug } } });
      return updated;
    });
    return apiSuccess(brand);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("EDITOR");
    const { id } = await params;
    const brand = await db.brand.update({ where: { id }, data: { active: false } });
    await db.auditLog.create({ data: { userId: actor.id, action: "UPDATE", resource: "Brand", resourceId: id, metadata: { name: brand.name, active: false } } });
    return apiSuccess(brand);
  } catch (error) { return apiError(error); }
}
