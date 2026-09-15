import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function PromotionsPage() {
  await requireRole("EDITOR");
  const [promotions, flashSales] = await Promise.all([
    db.promotion.findMany({ include: { _count: { select: { products: true, categories: true } } }, orderBy: { startsAt: "desc" } }),
    db.flashSale.findMany({ include: { _count: { select: { items: true } } }, orderBy: { startsAt: "desc" } }),
  ]);
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold">Promotions & Flash Sales</h1><p className="mt-1 text-sm text-ink-500">Campaign visibility and scheduling are backed by the commerce schema.</p></div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-ink-100 bg-white p-5"><h2 className="font-semibold">Promotions</h2><div className="mt-4 space-y-3">{promotions.length === 0 ? <p className="text-sm text-ink-500">No promotions yet.</p> : promotions.map((p) => <div key={p.id} className="rounded-xl border border-ink-100 p-3"><div className="flex justify-between gap-3"><span className="font-medium">{p.name}</span><span className="text-xs">{p.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-xs text-ink-500">{p.type} · {p.value} · {p._count.products} products · {p._count.categories} categories</p><p className="mt-1 text-xs text-ink-500">{p.startsAt.toLocaleDateString()} – {p.endsAt.toLocaleDateString()}</p></div>)}</div></section><section className="rounded-2xl border border-ink-100 bg-white p-5"><h2 className="font-semibold">Flash sales</h2><div className="mt-4 space-y-3">{flashSales.length === 0 ? <p className="text-sm text-ink-500">No flash sales yet.</p> : flashSales.map((sale) => <div key={sale.id} className="rounded-xl border border-ink-100 p-3"><div className="flex justify-between gap-3"><span className="font-medium">{sale.name}</span><span className="text-xs">{sale.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-xs text-ink-500">{sale._count.items} products · {sale.startsAt.toLocaleDateString()} – {sale.endsAt.toLocaleDateString()}</p></div>)}</div></section></div></main>;
}
