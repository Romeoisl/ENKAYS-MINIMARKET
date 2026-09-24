import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const sales = await db.flashSale.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    include: {
      items: {
        include: {
          product: { where: { published: true, status: { in: ["PUBLISHED", "OUT_OF_STOCK", "COMING_SOON"] } },
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
    },
    orderBy: { endsAt: "asc" },
  });

  return NextResponse.json({ data: sales });
}
