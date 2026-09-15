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
});

export async function GET() {
  try {
    await requireRole("EDITOR");
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
    const brand = await db.brand.create({ data });
    await db.auditLog.create({ data: { userId: actor.id, action: "CREATE", resource: "Brand", resourceId: brand.id, metadata: { name: brand.name, slug: brand.slug } } });
    return apiSuccess(brand);
  } catch (error) {
    return apiError(error);
  }
}
