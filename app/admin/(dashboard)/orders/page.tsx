import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);
}

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONTACTED: "bg-blue-50 text-blue-800",
  CONFIRMED: "bg-indigo-50 text-indigo-800",
  PROCESSING: "bg-purple-50 text-purple-800",
  SHIPPED: "bg-cyan-50 text-cyan-800",
  COMPLETED: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-red-50 text-red-800",
};

export default async function AdminOrdersPage() {
  await requireRole("EDITOR");
  const orders = await db.order.findMany({
    include: { items: { select: { id: true, productNameSnapshot: true, quantity: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-enkays-700">Operations</p>
        <h1 className="mt-1 text-3xl font-bold text-ink-900">Orders</h1>
        <p className="mt-2 text-sm text-ink-500">Review customer orders and monitor fulfilment status.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Payment</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-ink-50">
                  <td className="px-5 py-4 font-semibold text-ink-900"><Link href={`/admin/orders/${order.id}`} className="text-enkays-700 hover:underline">{order.orderNumber}</Link></td>
                  <td className="px-5 py-4"><p className="font-medium">{order.customerName}</p><p className="text-xs text-ink-500">{order.customerPhone}</p></td>
                  <td className="px-5 py-4">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="px-5 py-4 font-medium">{money(order.total)}</td>
                  <td className="px-5 py-4">{order.paymentStatus}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status] ?? "bg-ink-100 text-ink-700"}`}>{order.status}</span></td>
                  <td className="px-5 py-4 text-ink-500">{order.createdAt.toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <div className="p-10 text-center text-sm text-ink-500">No orders yet.</div>}
      </div>
    </main>
  );
}
