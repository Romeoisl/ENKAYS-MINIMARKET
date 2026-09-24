"use client";

import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-enkays-700" onClick={() => setOpen(false)}>
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 md:flex">
          <Link href="/products" className="hover:text-enkays-600">All Products</Link>
          <Link href="/categories" className="hover:text-enkays-600">Categories</Link>
        </nav>

        <form action="/products" className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-full border border-ink-100 px-4 py-2 md:flex">
          <Search size={16} className="text-ink-500" />
          <input name="q" placeholder="Search products, brands, SKUs..." className="w-full bg-transparent text-sm outline-none" />
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium text-ink-700">
            <Link href="/products" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-ink-50">All Products</Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-ink-50">Categories</Link>
          </nav>
          <form action="/products" className="mt-3 flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2">
            <Search size={16} className="text-ink-500" />
            <input name="q" placeholder="Search products..." className="w-full bg-transparent text-sm outline-none" />
          </form>
        </div>
      )}
    </header>
  );
}
