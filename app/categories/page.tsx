import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: {
            where: { published: true, status: "PUBLISHED" },
          },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-enkays-600">Browse by need</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Foodstuff Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
            Explore Enkays products by category and find the essentials you need.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-8 text-center text-ink-500">
            Categories will appear here as they are added.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-enkays-50 text-lg text-enkays-700">✦</span>
                <h2 className="mt-6 font-extrabold">{category.name}</h2>
                <p className="mt-1 text-xs text-ink-500">
                  {category._count.products} published product{category._count.products === 1 ? "" : "s"}
                </p>
                {category.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-5 text-ink-600">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
