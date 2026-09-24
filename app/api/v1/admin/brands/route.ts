import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
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
        where: { active: true, categoryAssignments: { some: { categoryId } } },
        orderBy: { name: "asc" },
      });
      return apiSuccess(brands);
    }
    const brands = await db.brand.findMany({
      include: { _count: { select: { products: true } }, categoryAssignments: { select: { categoryId: true } } },
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
      if (categoryIds.length) await tx.categoryBrand.createMany({
        data: categoryIds.map((categoryId) => ({ categoryId, brandId: created.id })),
        skipDuplicates: true,
      });
      await tx.auditLog.create({
        data: { userId: actor.id, action: "CREATE", resource: "Brand", resourceId: created.id, metadata: { name: created.name, slug: created.slug } },
      });
      return created;
    });
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error);
  }
}
