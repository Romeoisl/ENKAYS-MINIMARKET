"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ORDER_STATUSES = ["PENDING", "CONTACTED", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

type Props = { id: string; status: string; paymentStatus: string };

export function OrderStatusForm({ id, status, paymentStatus }: Props) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(status);
  const [payment, setPayment] = useState(paymentStatus);
  const [busy, setBusy] = useState(false);

  async function update(payload: Record<string, string>, success: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Could not update order");
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update order");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mt-4 space-y-4">
    <label className="block space-y-2 text-sm"><span className="text-ink-500">Order status</span><select disabled={busy} value={orderStatus} onChange={(event) => { const value = event.target.value; setOrderStatus(value); void update({ status: value }, "Order status updated"); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2">{ORDER_STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
    <label className="block space-y-2 text-sm"><span className="text-ink-500">Payment status</span><select disabled={busy} value={payment} onChange={(event) => { const value = event.target.value; setPayment(value); void update({ paymentStatus: value }, "Payment status updated"); }} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2">{PAYMENT_STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
  </div>;
}
