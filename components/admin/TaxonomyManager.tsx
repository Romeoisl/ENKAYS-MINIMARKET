"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string; slug: string; description: string | null; parentId: string | null; active: boolean; position: number; parent?: { id: string; name: string } | null; _count: { products: number; children: number } };
type Brand = { id: string; name: string; slug: string; description: string | null; active: boolean; categoryAssignments: { categoryId: string }[]; _count: { products: number } };

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? "Request failed");
  return payload.data as T;
}

const emptyCategory = { name: "", slug: "", description: "", parentId: "", active: true, position: 0 };
const emptyBrand = { name: "", slug: "", description: "", active: true, categoryIds: [] as string[] };

export function TaxonomyManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [category, setCategory] = useState(emptyCategory);
  const [brand, setBrand] = useState(emptyBrand);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryOptions = useMemo(() => categories.filter((item) => item.id !== editingCategory), [categories, editingCategory]);

  async function load() {
    setLoading(true);
    try {
      const [categoryData, brandData] = await Promise.all([
        request<Category[]>("/api/v1/admin/categories"),
        request<Brand[]>("/api/v1/admin/brands"),
      ]);
      setCategories(categoryData);
      setBrands(brandData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load categories and brands");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    try {
      const body = { ...category, description: category.description || null, parentId: category.parentId || null, position: Number(category.position) };
      await request(`/api/v1/admin/categories${editingCategory ? `/${editingCategory}` : ""}`, { method: editingCategory ? "PUT" : "POST", body: JSON.stringify(body) });
      toast.success(editingCategory ? "Category updated" : "Category created");
      setCategory(emptyCategory); setEditingCategory(null); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save category"); }
  }

  async function saveBrand(event: FormEvent) {
    event.preventDefault();
    try {
      const body = { ...brand, description: brand.description || null };
      await request(`/api/v1/admin/brands${editingBrand ? `/${editingBrand}` : ""}`, { method: editingBrand ? "PUT" : "POST", body: JSON.stringify(body) });
      toast.success(editingBrand ? "Brand updated" : "Brand created");
      setBrand(emptyBrand); setEditingBrand(null); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save brand"); }
  }

  async function deactivate(kind: "categories" | "brands", id: string) {
    if (!window.confirm("Deactivate this item? Existing products and orders will be preserved.")) return;
    try { await request(`/api/v1/admin/${kind}/${id}`, { method: "DELETE" }); toast.success("Deactivated"); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not deactivate"); }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading catalogue structure…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-5">
        <div><h2 className="text-lg font-semibold text-ink-950">Categories</h2><p className="text-sm text-ink-500">Build parent categories and subcategories without deleting catalogue history.</p></div>
        <form onSubmit={saveCategory} className="space-y-3 rounded-xl border border-ink-100 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} placeholder="Category name" className="rounded-lg border p-2.5 text-sm" />
            <input required value={category.slug} onChange={(e) => setCategory({ ...category, slug: e.target.value.toLowerCase() })} placeholder="category-slug" className="rounded-lg border p-2.5 text-sm" />
          </div>
          <textarea value={category.description} onChange={(e) => setCategory({ ...category, description: e.target.value })} placeholder="Description (optional)" className="min-h-20 w-full rounded-lg border p-2.5 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={category.parentId} onChange={(e) => setCategory({ ...category, parentId: e.target.value })} className="rounded-lg border p-2.5 text-sm">
              <option value="">No parent (top level)</option>{categoryOptions.map((item) => <option key={item.id} value={item.id}>{item.parent ? `${item.parent.name} / ` : ""}{item.name}</option>)}
            </select>
            <input type="number" min="0" value={category.position} onChange={(e) => setCategory({ ...category, position: Number(e.target.value) })} placeholder="Position" className="rounded-lg border p-2.5 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={category.active} onChange={(e) => setCategory({ ...category, active: e.target.checked })} /> Active</label>
          <div className="flex gap-2"><button className="rounded-lg bg-ink-950 px-4 py-2 text-sm font-medium text-white">{editingCategory ? "Update category" : "Add category"}</button>{editingCategory && <button type="button" onClick={() => { setEditingCategory(null); setCategory(emptyCategory); }} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}</div>
        </form>
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          {categories.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-ink-100 p-3 last:border-0">
            <div><p className="font-medium">{item.parent ? `${item.parent.name} / ` : ""}{item.name}</p><p className="text-xs text-ink-500">/{item.slug} · {item._count.products} products · {item.categoryAssignments.length} categories · {item.active ? "Active" : "Inactive"}</p></div>
            <div className="flex gap-2"><button onClick={() => { setEditingCategory(item.id); setCategory({ name: item.name, slug: item.slug, description: item.description ?? "", parentId: item.parentId ?? "", active: item.active, position: item.position }); }} className="text-sm font-medium">Edit</button>{item.active && <button onClick={() => void deactivate("categories", item.id)} className="text-sm text-red-600">Deactivate</button>}</div>
          </div>)}
        </div>
      </section>

      <section className="space-y-5">
        <div><h2 className="text-lg font-semibold text-ink-950">Brands</h2><p className="text-sm text-ink-500">Manage brand identity and product associations safely.</p></div>
        <form onSubmit={saveBrand} className="space-y-3 rounded-xl border border-ink-100 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2"><input required value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="Brand name" className="rounded-lg border p-2.5 text-sm" /><input required value={brand.slug} onChange={(e) => setBrand({ ...brand, slug: e.target.value.toLowerCase() })} placeholder="brand-slug" className="rounded-lg border p-2.5 text-sm" /></div>
          <textarea value={brand.description} onChange={(e) => setBrand({ ...brand, description: e.target.value })} placeholder="Description (optional)" className="min-h-20 w-full rounded-lg border p-2.5 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={brand.active} onChange={(e) => setBrand({ ...brand, active: e.target.checked })} /> Active</label>
          <div className="space-y-2">
            <p className="text-sm font-medium">Assigned categories</p>
            <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
              {categories.filter((item) => item.active).map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={brand.categoryIds.includes(item.id)}
                    onChange={(e) => setBrand({ ...brand, categoryIds: e.target.checked ? [...brand.categoryIds, item.id] : brand.categoryIds.filter((id) => id !== item.id) })}
                  />
                  {item.name}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-500">Only these categories will show this brand in the product form.</p>
          </div>
          <div className="flex gap-2"><button className="rounded-lg bg-ink-950 px-4 py-2 text-sm font-medium text-white">{editingBrand ? "Update brand" : "Add brand"}</button>{editingBrand && <button type="button" onClick={() => { setEditingBrand(null); setBrand(emptyBrand); }} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}</div>
        </form>
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          {brands.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-ink-100 p-3 last:border-0"><div><p className="font-medium">{item.name}</p><p className="text-xs text-ink-500">/{item.slug} · {item._count.products} products · {item.active ? "Active" : "Inactive"}</p></div><div className="flex gap-2"><button onClick={() => { setEditingBrand(item.id); setBrand({ name: item.name, slug: item.slug, description: item.description ?? "", active: item.active, categoryIds: item.categoryAssignments.map((assignment) => assignment.categoryId) }); }} className="text-sm font-medium">Edit</button>{item.active && <button onClick={() => void deactivate("brands", item.id)} className="text-sm text-red-600">Deactivate</button>}</div></div>)}
        </div>
      </section>
    </div>
  );
}
