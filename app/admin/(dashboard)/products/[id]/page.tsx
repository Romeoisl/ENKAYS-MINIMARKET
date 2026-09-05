import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("EDITOR");
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } });
  if (!product) notFound();
  return <main className="mx-auto max-w-5xl space-y-6"><div><Link href="/admin/products" className="text-sm font-medium text-enkays-700 hover:underline">← Products</Link><h1 className="mt-2 text-3xl font-bold text-ink-900">Edit product</h1><p className="mt-2 text-sm text-ink-500">Update catalog details and media for {product.name}.</p></div><ProductForm product={product} /></main>;
}
