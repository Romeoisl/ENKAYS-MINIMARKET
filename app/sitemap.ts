import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://enkays-foods-and-more.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const products = await db.product.findMany({
      where: { published: true, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    return [
      ...baseEntries,
      ...products.map((product) => ({
        url: `${SITE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return baseEntries;
  }
}
