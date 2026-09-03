"use client";

import { MessageCircle } from "lucide-react";
import { buildProductWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton(props: {
  whatsappNumber: string;
  siteName: string;
  productName: string;
  price?: number | null;
  sku?: string;
  productUrl?: string;
}) {
  const href = buildProductWhatsAppLink(props);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
    >
      <MessageCircle size={18} />
      Order on WhatsApp
    </a>
  );
}
