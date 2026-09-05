import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("EDITOR");
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, customer: true } });
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm font-medium text-enkays-700 hover:underline">← Orders</Link>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">{order.orderNumber}</h1>
        <p className="mt-2 text-sm text-ink-500">Created {order.createdAt.toLocaleString("en-NG")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-bold">Order items</h2>
          <div className="mt-4 divide-y divide-ink-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                <div><p className="font-medium text-ink-900">{item.productNameSnapshot}</p><p className="text-xs text-ink-500">{item.skuSnapshot} · Qty {item.quantity}</p></div>
                <p className="font-semibold">{money(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between py-1"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            <div className="flex justify-between py-1"><span>Shipping</span><span>{money(order.shipping)}</span></div>
            <div className="flex justify-between py-1"><span>Discount</span><span>-{money(order.discount)}</span></div>
            <div className="mt-2 flex justify-between border-t border-ink-100 pt-3 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div>
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="font-bold">Customer</h2><div className="mt-4 space-y-2 text-sm"><p className="font-medium">{order.customerName}</p><p>{order.customerPhone}</p>{order.customerEmail && <p>{order.customerEmail}</p>}</div></section>
          <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="font-bold">Fulfilment</h2><OrderStatusForm id={order.id} status={order.status} paymentStatus={order.paymentStatus} /><div className="mt-4 space-y-3 text-sm">{order.paymentMethod && <p><span className="text-ink-500">Method:</span> {order.paymentMethod}</p>}{order.deliveryMethod && <p><span className="text-ink-500">Delivery:</span> {order.deliveryMethod}</p>}{order.deliveryAddress && <p><span className="text-ink-500">Address:</span> {order.deliveryAddress}</p>}</div></section>
        </aside>
      </div>
    </main>
  );
}
