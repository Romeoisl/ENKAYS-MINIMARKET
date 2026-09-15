import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function CouponsPage() {
  await requireRole("EDITOR");
  const coupons = await db.coupon.findMany({ include: { _count: { select: { usages: true } } }, orderBy: { createdAt: "desc" } });
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold">Coupons</h1><p className="mt-1 text-sm text-ink-500">Monitor discount codes, limits, expiry and redemption volume.</p></div><div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white"><table className="min-w-full text-sm"><thead className="border-b border-ink-100 bg-ink-50"><tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Discount</th><th className="px-4 py-3 text-left">Usage</th><th className="px-4 py-3 text-left">Expiry</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody className="divide-y divide-ink-100">{coupons.map((c) => <tr key={c.id}><td className="px-4 py-3 font-semibold">{c.code}</td><td className="px-4 py-3">{c.type} · {c.value}</td><td className="px-4 py-3">{c.usageCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""} ({c._count.usages} records)</td><td className="px-4 py-3">{c.expiresAt ? c.expiresAt.toLocaleDateString() : "No expiry"}</td><td className="px-4 py-3">{c.active ? "Active" : "Inactive"}</td></tr>)}</tbody></table>{coupons.length === 0 && <p className="p-6 text-sm text-ink-500">No coupons yet.</p>}</div></main>;
}
