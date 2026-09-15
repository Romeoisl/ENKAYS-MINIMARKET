import { requireRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function CmsPage() {
  await requireRole("EDITOR");
  const content = await db.cmsContent.findMany({ orderBy: [{ type: "asc" }, { position: "asc" }] });
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold">CMS Builder</h1><p className="mt-1 text-sm text-ink-500">Manage structured homepage, hero, banner, FAQ, testimonial and SEO content.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{content.map((item) => <article key={item.id} className="rounded-2xl border border-ink-100 bg-white p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-ink-100 px-2 py-1 text-[11px] font-semibold">{item.type}</span><span className="text-xs text-ink-500">Position {item.position}</span></div><h2 className="mt-4 font-semibold">{item.title ?? item.key}</h2><p className="mt-2 text-sm text-ink-500">{item.active ? "Published" : "Draft / inactive"}{item.startsAt ? ` · starts ${item.startsAt.toLocaleDateString()}` : ""}{item.endsAt ? ` · ends ${item.endsAt.toLocaleDateString()}` : ""}</p></article>)}{content.length === 0 && <p className="text-sm text-ink-500">No CMS blocks yet.</p>}</div></main>;
}
