import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireRole } from "@/lib/permissions";

export default async function NewProductPage() {
  await requireRole("EDITOR");
  return <main className="mx-auto max-w-5xl space-y-6"><div><Link href="/admin/products" className="text-sm font-medium text-enkays-700 hover:underline">← Products</Link><h1 className="mt-2 text-3xl font-bold text-ink-900">Add product</h1><p className="mt-2 text-sm text-ink-500">Create a catalog item, then upload its Cloudinary media.</p></div><ProductForm /></main>;
}
