import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

const PAGE_SIZE = 20;
const statuses = ["ALL", "DRAFT", "PUBLISHED", "OUT_OF_STOCK", "COMING_SOON", "UNAVAILABLE"] as const;

type SearchParams = { q?: string; status?: string; page?: string };

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);
}

function pageUrl(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/admin/products?${value}` : "/admin/products";
}

export default async function AdminProductsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  await requireRole("EDITOR");
  const params = (await searchParams) ?? {};
  const q = params.q?.trim() ?? "";
  const status = statuses.includes(params.status as (typeof statuses)[number]) ? (params.status as (typeof statuses)[number]) : "ALL";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where = {
    status: status === "ALL" ? { not: "ARCHIVED" as const } : status,
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { sku: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [products, total] = await Promise.all([
    db.product.findMany({ where, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: { select: { name: true } }, brand: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <main className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-enkays-700">Catalog</p><h1 className="mt-1 text-3xl font-bold text-ink-900">Products</h1><p className="mt-2 text-sm text-ink-500">Create, edit, publish and manage your catalog.</p></div><Link href="/admin/products/new" className="rounded-xl bg-enkays-700 px-4 py-2.5 text-center text-sm font-semibold text-white">Add product</Link></div>
    <form method="get" className="grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_200px_auto]">
      <input name="q" defaultValue={q} placeholder="Search name, SKU or slug" className="rounded-xl border border-ink-200 px-3 py-2.5 text-sm" />
      <select name="status" defaultValue={status} className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm">{statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All active products" : item.replaceAll("_", " ")}</option>)}</select>
      <button className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold hover:bg-ink-50">Filter</button>
    </form>
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="border-b border-ink-100 bg-ink-50"><tr><th className="px-5 py-3 text-left">Product</th><th className="px-5 py-3 text-left">SKU</th><th className="px-5 py-3 text-left">Price</th><th className="px-5 py-3 text-left">Stock</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-ink-100">{products.map((product) => <tr key={product.id} className="hover:bg-ink-50"><td className="px-5 py-4"><div className="flex items-center gap-3">{product.images[0] ? <img src={product.images[0].secureUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-ink-100" />}<div><p className="font-semibold text-ink-900">{product.name}</p><p className="text-xs text-ink-500">{product.brand?.name ?? "No brand"} · {product.category?.name ?? "No category"}</p></div></div></td><td className="px-5 py-4 text-ink-600">{product.sku}</td><td className="px-5 py-4 font-medium">{money(product.price)}</td><td className="px-5 py-4">{product.stock}</td><td className="px-5 py-4"><span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium">{product.status}</span></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-3"><Link href={`/admin/products/${product.id}`} className="font-semibold text-enkays-700 hover:underline">Edit</Link><DeleteProductButton productId={product.id} productName={product.name} /></div></td></tr>)}</tbody></table></div>{products.length === 0 && <div className="p-10 text-center text-sm text-ink-500">No products match these filters.</div>}
      {totalPages > 1 && <div className="flex items-center justify-between border-t border-ink-100 px-5 py-4 text-sm"><span className="text-ink-500">Page {Math.min(page, totalPages)} of {totalPages} · {total} products</span><div className="flex gap-2">{page > 1 && <Link href={pageUrl(params, page - 1)} className="rounded-lg border border-ink-200 px-3 py-2 font-semibold">Previous</Link>}{page < totalPages && <Link href={pageUrl(params, page + 1)} className="rounded-lg border border-ink-200 px-3 py-2 font-semibold">Next</Link>}</div></div>}
    </div>
  </main>;
}
