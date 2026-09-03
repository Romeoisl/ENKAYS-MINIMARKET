import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [total, published, draft, outOfStock, orders, pendingOrders] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { status: "PUBLISHED" } }),
      db.product.count({ where: { status: "DRAFT" } }),
      db.product.count({ where: { status: "OUT_OF_STOCK" } }),
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    { label: "Total Products", value: total },
    { label: "Published", value: published },
    { label: "Draft", value: draft },
    { label: "Out of Stock", value: outOfStock },
    { label: "Orders", value: orders },
    { label: "Pending Orders", value: pendingOrders },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-ink-500">
        Signed in as {session.user.email}
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl2 border border-ink-100 bg-white p-4"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
