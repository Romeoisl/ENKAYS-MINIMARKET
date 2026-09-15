import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function CustomersPage() {
  await requireRole("EDITOR");
  const customers = await db.customer.findMany({ include: { _count: { select: { orders: true, wishlist: true, reviews: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold">Customers</h1><p className="mt-1 text-sm text-ink-500">Customer records with order, wishlist and review activity.</p></div><div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white"><table className="min-w-full text-sm"><thead className="border-b border-ink-100 bg-ink-50"><tr><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Orders</th><th className="px-4 py-3 text-left">Wishlist</th><th className="px-4 py-3 text-left">Reviews</th></tr></thead><tbody className="divide-y divide-ink-100">{customers.map((c) => <tr key={c.id}><td className="px-4 py-3"><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-500">{c.email ?? "No email"}</p></td><td className="px-4 py-3">{c.phone ?? "—"}</td><td className="px-4 py-3">{c._count.orders}</td><td className="px-4 py-3">{c._count.wishlist}</td><td className="px-4 py-3">{c._count.reviews}</td></tr>)}</tbody></table>{customers.length === 0 && <p className="p-6 text-sm text-ink-500">No customers yet.</p>}</div></main>;
}
