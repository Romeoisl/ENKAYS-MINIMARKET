import Link from "next/link";
import { Search, Heart, ShoppingCart, Menu } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button className="md:hidden" aria-label="Open menu">
          <Menu size={22} />
        </button>

        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-enkays-700">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 md:flex">
          <Link href="/products" className="hover:text-enkays-600">
            All Products
          </Link>
          <Link href="/categories" className="hover:text-enkays-600">
            Categories
          </Link>
          <Link href="/deals" className="hover:text-enkays-600">
            Deals
          </Link>
        </nav>

        <form
          action="/products"
          className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-full border border-ink-100 px-4 py-2 md:flex"
        >
          <Search size={16} className="text-ink-500" />
          <input
            name="q"
            placeholder="Search products, brands, SKUs..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link href="/wishlist" aria-label="Wishlist">
            <Heart size={22} />
          </Link>
          <Link href="/cart" aria-label="Cart">
            <ShoppingCart size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
