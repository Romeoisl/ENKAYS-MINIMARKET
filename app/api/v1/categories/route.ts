import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    where: { active: true, parentId: null },
    include: {
      children: { where: { active: true }, orderBy: { position: "asc" } },
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ data: categories });
}
