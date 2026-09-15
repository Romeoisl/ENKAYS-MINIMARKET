import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function AnalyticsPage() {
  await requireRole("EDITOR");
  const [events, products, orders, customers] = await Promise.all([db.analyticsEvent.count(), db.product.count(), db.order.count(), db.customer.count()]);
  const recent = await db.analyticsEvent.groupBy({ by: ["type"], _count: { _all: true }, orderBy: { _count: { type: "desc" } }, take: 10 });
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold">Analytics</h1><p className="mt-1 text-sm text-ink-500">Commerce activity at a glance, built on first-party event data.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Events", events],["Products", products],["Orders", orders],["Customers", customers]].map(([label,value]) => <div key={label} className="rounded-2xl border border-ink-100 bg-white p-5"><p className="text-sm text-ink-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div><section className="rounded-2xl border border-ink-100 bg-white p-5"><h2 className="font-semibold">Top event types</h2><div className="mt-4 space-y-2">{recent.map((row) => <div key={row.type} className="flex justify-between border-b border-ink-100 py-2 text-sm last:border-0"><span>{row.type}</span><span className="font-semibold">{row._count._all}</span></div>)}</div></section></main>;
}
