import { db } from "@/lib/db";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductCard } from "@/components/public/ProductCard";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { Prisma } from "@prisma/client";
import { ProductStatus } from "@prisma/client";

export const metadata = { title: "All Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; brand?: string }>;
}) {
  const { q, page: pageParam, category, brand } = await searchParams;
  const parsedPage = Number(pageParam ?? "1");
  const page = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;

  const where = {
    published: true,
    status: { in: [ProductStatus.PUBLISHED, ProductStatus.OUT_OF_STOCK, ProductStatus.COMING_SOON] },
    ...(category ? { category: { slug: category, active: true } } : {}),
    ...(brand ? { brand: { slug: brand, active: true } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { brand: { name: { contains: q, mode: "insensitive" as const } } },
            { category: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  let products: Prisma.ProductGetPayload<{
    include: {
      images: { orderBy: { position: "asc" }; take: 1 };
      category: true;
      brand: true;
    };
  }>[] = [];
  let total = 0;
  let categories: { name: string; slug: string }[] = [];
  let brands: { name: string; slug: string }[] = [];

  try {
    const [queriedProducts, queriedTotal, queriedCategories, queriedBrands] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
          brand: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PRODUCTS_PER_PAGE,
        take: PRODUCTS_PER_PAGE,
      }),
      db.product.count({ where }),
      db.category.findMany({
        where: { active: true },
        select: { name: true, slug: true },
        orderBy: { position: "asc" },
      }),
      db.brand.findMany({
        where: { active: true },
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);
    products = queriedProducts;
    total = queriedTotal;
    categories = queriedCategories;
    brands = queriedBrands;
  } catch (error) {
    console.error("[products] catalog query failed", error);
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-ink-900">Products are temporarily unavailable</h1>
          <p className="mt-2 text-sm text-ink-500">Please refresh in a moment. If the problem continues, contact Enkays Foods & More.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const filterQuery = (overrides: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams();
    const values = { q, category, brand, ...overrides };
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    return params.toString();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {q ? `Results for "${q}"` : "All Products"}
            </h1>
            <p className="text-sm text-ink-500">{total} products found</p>
          </div>
          {(category || brand) && (
            <Link href="/products" className="text-sm font-medium text-enkays-600 hover:underline">
              Clear filters
            </Link>
          )}
        </div>

        <form action="/products" className="mt-6 grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:grid-cols-3">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products, brands, categories or SKUs..."
            className="rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-enkays-400"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-enkays-400"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={brand ?? ""}
            className="rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-enkays-400"
          >
            <option value="">All brands</option>
            {brands.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-enkays-600 px-4 py-2 text-sm font-semibold text-white sm:col-span-3 sm:w-fit">
            Apply filters
          </button>
        </form>

        {products.length === 0 ? (
          <p className="mt-8 text-ink-500">
            No products matched your search. Try another term or browse the available categories.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2 text-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              const href = filterQuery({ page: String(n) });
              return (
                <Link
                  key={n}
                  href={`/products?${href}`}
                  className={`rounded-full px-3 py-1 ${n === page ? "bg-enkays-600 text-white" : "border border-ink-100 bg-white"}`}
                >
                  {n}
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
