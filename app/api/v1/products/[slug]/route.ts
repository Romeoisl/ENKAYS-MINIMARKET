import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { where: { active: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product || !product.published) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const reviewCount = product.reviews.length;
  const rating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  return NextResponse.json({ data: { ...product, rating, reviewCount } });
}
