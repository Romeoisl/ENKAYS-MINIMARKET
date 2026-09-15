import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  active: z.boolean().default(true),
  position: z.number().int().min(0).max(100000).default(0),
});

export async function GET() {
  try {
    await requireRole("EDITOR");
    const categories = await db.category.findMany({
      include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true, children: true } } },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
    return apiSuccess(categories);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole("EDITOR");
    const data = categorySchema.parse(await request.json());
    if (data.parentId) {
      const parent = await db.category.findUnique({ where: { id: data.parentId }, select: { id: true } });
      if (!parent) throw new ApiError("NOT_FOUND", "Parent category not found", 404);
    }
    const category = await db.category.create({ data });
    await db.auditLog.create({ data: { userId: actor.id, action: "CREATE", resource: "Category", resourceId: category.id, metadata: { name: category.name, slug: category.slug } } });
    return apiSuccess(category);
  } catch (error) {
    return apiError(error);
  }
}
