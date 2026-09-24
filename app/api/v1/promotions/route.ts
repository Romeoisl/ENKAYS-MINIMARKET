import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const promotions = await db.promotion.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    include: {
      products: {
        include: {
          product: { where: { published: true, status: { in: ["PUBLISHED", "OUT_OF_STOCK", "COMING_SOON"] } },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
      categories: { include: { category: true } },
    },
    orderBy: { endsAt: "asc" },
  });

  return NextResponse.json({ data: promotions });
}
