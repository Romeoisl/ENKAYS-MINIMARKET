import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { CallOrderButton } from "@/components/public/CallOrderButton";
import { formatPrice, stockLabel, cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, published: true, status: { in: ["PUBLISHED", "OUT_OF_STOCK", "COMING_SOON"] } },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      reviews: { where: { status: "APPROVED" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: { images: product.images[0]?.url ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  const stock = product.status === "OUT_OF_STOCK"
    ? { label: "Out of stock", tone: "out-of-stock" as const }
    : product.status === "COMING_SOON"
      ? { label: "Coming soon", tone: "low-stock" as const }
      : stockLabel(product.stock);
  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : null;
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl2 bg-ink-100">
              {product.images[0] ? (
                <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-300">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((img) => (
                  <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg bg-ink-100">
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {product.brand && <p className="text-sm font-medium text-enkays-600">{product.brand.name}</p>}
            <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
            {avgRating && <p className="mt-1 text-sm text-ink-500">★ {avgRating} ({reviewCount} review{reviewCount === 1 ? "" : "s"})</p>}
            <div className="mt-4 flex items-baseline gap-3">
              {product.priceVisibility === "SHOW_PRICE" ? (
                <>
                  <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && <span className="text-lg text-ink-500 line-through">{formatPrice(product.compareAtPrice)}</span>}
                </>
              ) : <span className="text-xl font-semibold">Contact for price</span>}
            </div>
            <p className={cn("mt-2 text-sm font-medium", `stock-${stock.tone}`)}>{stock.label}</p>
            {product.shortDescription && <p className="mt-4 text-ink-700">{product.shortDescription}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {settings?.whatsappNumber && <WhatsAppButton whatsappNumber={settings.whatsappNumber} siteName={settings.siteName ?? SITE_NAME} productName={product.name} price={product.priceVisibility === "SHOW_PRICE" ? product.price : null} sku={product.sku} productUrl={productUrl} />}
              {settings?.phoneNumber && <CallOrderButton phoneNumber={settings.phoneNumber} />}
            </div>
            <p className="mt-3 text-xs text-ink-500">Interested in this item? Order directly through WhatsApp or call us.</p>
            <div className="mt-8 border-t border-ink-100 pt-6">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-line text-ink-700">{product.description}</p>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-2 text-sm text-ink-500">
              <dt>SKU</dt><dd className="text-ink-900">{product.sku}</dd>
              {product.category && <><dt>Category</dt><dd className="text-ink-900"><a href={`/products?category=${encodeURIComponent(product.category.slug)}`} className="hover:text-enkays-600 hover:underline">{product.category.name}</a></dd></>}
              {product.brand && <><dt>Brand</dt><dd className="text-ink-900"><a href={`/products?brand=${encodeURIComponent(product.brand.slug)}`} className="hover:text-enkays-600 hover:underline">{product.brand.name}</a></dd></>}
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
