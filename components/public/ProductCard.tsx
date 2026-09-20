import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatPrice, stockLabel, cn } from "@/lib/utils";

type ProductCardData = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  category?: { name: string; slug: string } | null;
  brand?: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const stock = stockLabel(product.stock);
  const image = product.images[0];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl2 border border-ink-100 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square bg-ink-100">
        {image ? (
          <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">No image</div>
        )}
        {discount && <span className="absolute left-2 top-2 rounded-full bg-enkays-600 px-2 py-1 text-xs font-semibold text-white">-{discount}%</span>}
        <button aria-label="Add to wishlist" className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow" onClick={(e) => e.preventDefault()}>
          <Heart size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && <p className="text-[10px] font-bold uppercase tracking-wider text-enkays-600">{product.category.name}</p>}
        <p className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</p>
        {product.brand && <p className="text-xs text-ink-500">{product.brand.name}</p>}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-semibold text-ink-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-ink-500 line-through">{formatPrice(product.compareAtPrice)}</span>}
        </div>
        <p className={cn("text-xs", `stock-${stock.tone}`)}>{stock.label}</p>
      </div>
    </Link>
  );
}
