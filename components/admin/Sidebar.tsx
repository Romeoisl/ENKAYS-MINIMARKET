import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const GROUPS = [
  { title: "Store", links: [{ href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/products", label: "Products" }, { href: "/admin/categories", label: "Categories & Brands" }, { href: "/admin/orders", label: "Orders" }] },
  { title: "Growth", links: [{ href: "/admin/promotions", label: "Promotions & Flash Sales" }, { href: "/admin/coupons", label: "Coupons" }, { href: "/admin/cms", label: "CMS Builder" }] },
  { title: "Insights", links: [{ href: "/admin/analytics", label: "Analytics" }, { href: "/admin/customers", label: "Customers" }] },
];

export function Sidebar() {
  return <aside className="w-60 shrink-0 border-r border-ink-100 bg-white p-4"><p className="mb-6 text-sm font-bold text-enkays-700">{SITE_NAME}</p><nav aria-label="Admin navigation" className="space-y-5 text-sm">{GROUPS.map(group => <div key={group.title}><p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{group.title}</p>{group.links.map(link => <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100 focus:outline-none focus:ring-2 focus:ring-enkays-500">{link.label}</Link>)}</div>)}</nav></aside>;
}
