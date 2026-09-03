import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-ink-100 bg-white p-4">
      <p className="mb-6 text-sm font-bold text-enkays-700">{SITE_NAME}</p>
      <nav className="flex flex-col gap-1 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
