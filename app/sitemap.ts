import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://enkays-foods-and-more.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { published: true, status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      { url: SITE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
      ...categories.map((c) => ({
        url: `${SITE_URL}/shop/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return [
      { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
      { url: `${SITE_URL}/shop`, changeFrequency: "weekly", priority: 0.9 },
    ];
  }
}
