import { db } from "@/lib/db";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProductCard } from "@/components/public/ProductCard";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export const metadata = { title: "All Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const { q, page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));

  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold">
          {q ? `Results for "${q}"` : "All Products"}
        </h1>
        <p className="mb-6 text-sm text-ink-500">{total} products found</p>

        {products.length === 0 ? (
          <p className="text-ink-500">
            No products matched your search. Try a different term or browse
            categories instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2 text-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <a
                key={n}
                href={`/products?page=${n}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-full px-3 py-1 ${
                  n === page ? "bg-enkays-600 text-white" : "bg-white border border-ink-100"
                }`}
              >
                {n}
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
