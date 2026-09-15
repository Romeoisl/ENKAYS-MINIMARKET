import { requireRole } from "@/lib/permissions";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export default async function CategoriesPage() {
  await requireRole("EDITOR");
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold text-ink-950">Categories & Brands</h1><p className="mt-1 text-sm text-ink-500">Control catalogue structure, hierarchy, ordering, and brand identity.</p></div><TaxonomyManager /></main>;
}
