"use client";

import { Phone } from "lucide-react";

export function CallOrderButton({ phoneNumber }: { phoneNumber: string }) {
  const href = `tel:${phoneNumber.replace(/[^+\d]/g, "")}`;
  return (
    <a href={href} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-enkays-500">
      <Phone size={18} />
      Call to Order
    </a>
  );
}
