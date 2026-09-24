import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);
}

export default async function AdminDashboardPage() {
  await requireRole("EDITOR");
  const [products, published, lowStock, orders, pendingReviews, customers, revenue] = await Promise.all([
    db.product.count({ where: { status: { not: "ARCHIVED" } } }),
    db.product.count({ where: { status: "PUBLISHED", published: true } }),
    db.product.count({ where: { stock: { gt: 0, lte: 5 }, status: { not: "ARCHIVED" } } }),
    db.order.count(),
    db.review.count({ where: { status: "PENDING" } }),
    db.customer.count(),
    db.order.aggregate({ where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"] }, paymentStatus: "PAID" }, _sum: { total: true } }),
  ]);
  const cards = [["Products", products, "/admin/products"], ["Published", published, "/admin/products"], ["Low stock", lowStock, "/admin/products"], ["Orders", orders, "/admin/orders"], ["Customers", customers, "/admin/customers"], ["Pending reviews", pendingReviews, "/admin/analytics"]] as const;
  return (
    <main className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-enkays-700">ENKAYS MINI-MARKETPLACE</p><h1 className="mt-1 text-3xl font-bold text-ink-900">Dashboard</h1><p className="mt-2 text-sm text-ink-500">A quick view of your marketplace.</p></div>
        <Link href="/admin/products/new" className="rounded-xl bg-enkays-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-enkays-800">Add product</Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, href]) => <Link key={label} href={href} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm text-ink-500">{label}</p><p className="mt-2 text-3xl font-bold text-ink-900">{value}</p></Link>)}</section>
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><p className="text-sm text-ink-500">Paid revenue</p><p className="mt-2 text-4xl font-bold text-ink-900">{money(revenue._sum.total ?? 0)}</p><p className="mt-2 text-sm text-ink-500">Confirmed, processing, shipped and completed orders only.</p></section>
    </main>
  );
}
