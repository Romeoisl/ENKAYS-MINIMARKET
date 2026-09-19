import { db } from "@/lib/db";
import { BRAND_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { CallOrderButton } from "@/components/public/CallOrderButton";
import Link from "next/link";
import Image from "next/image";

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);
}
function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([
    db.product.findMany({ where: { published: true, status: "PUBLISHED" }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 8 }),
    db.category.findMany({ where: { active: true, parentId: null }, orderBy: { position: "asc" }, take: 8 }),
    db.siteSettings.findUnique({ where: { id: 1 } }),
  ]);
  const phone = settings?.phoneNumber;
  const whatsapp = settings?.whatsappNumber;
  const directMessage = "Hello Enkays Foods & More, I would like to make an order.";

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-20 md:pb-0">
      <section className="enkays-hero enkays-noise text-white">
        <div className="enkays-grid absolute inset-0" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Enkays Foods & More home" className="text-xl font-black tracking-tight sm:text-2xl">ENKAYS<span className="text-amber-300">.</span></Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex"><Link href="/products" className="transition hover:text-white">Shop</Link><a href="#categories" className="transition hover:text-white">Categories</a><a href="#popular" className="transition hover:text-white">Popular</a></nav>
          <div className="flex items-center gap-2">{phone && <CallOrderButton phoneNumber={phone} />}{whatsapp && <a href={whatsappUrl(whatsapp, directMessage)} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#083a28] shadow-lg transition hover:-translate-y-0.5">WhatsApp</a>}</div>
        </header>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full enkays-glass px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-100">Foodstuff, done better</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.96] tracking-[-.04em] sm:text-6xl lg:text-7xl">Your everyday food essentials, <span className="text-emerald-300">sorted.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{BRAND_DESCRIPTION}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="rounded-full bg-amber-300 px-6 py-3.5 text-sm font-black text-[#142a1f] shadow-xl transition hover:-translate-y-0.5 hover:bg-amber-200">Explore foodstuff</Link>{whatsapp && <a href={whatsappUrl(whatsapp, directMessage)} className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">Order on WhatsApp</a>}</div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-xs text-white/65"><div><strong className="block text-lg text-white">Quality</strong>Carefully selected essentials</div><div><strong className="block text-lg text-white">Direct</strong>Talk to us before you buy</div><div><strong className="block text-lg text-white">Local</strong>Built for everyday life</div></div>
          </div>
          <div className="relative hidden min-h-[420px] lg:block"><div className="absolute inset-8 rounded-[3rem] border border-white/10 bg-white/[.045] shadow-2xl backdrop-blur-sm" /><div className="absolute left-10 top-10 rounded-3xl bg-amber-300 p-5 text-[#173223] shadow-2xl rotate-[-7deg]"><span className="text-4xl">₦</span><p className="mt-1 text-xs font-black uppercase tracking-widest">Food first</p></div><div className="absolute bottom-14 right-4 w-72 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">{SITE_NAME}</p><p className="mt-3 text-3xl font-black leading-tight">Good food starts with good staples.</p><p className="mt-4 text-sm leading-6 text-white/60">{SITE_TAGLINE}</p></div></div>
        </div>
      </section>

      <section className="border-b border-emerald-950/5 bg-white" aria-label="Enkays service highlights"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4"><div className="bg-white px-5 py-5 text-center"><strong className="block text-sm font-black text-[#10231a]">Food-first range</strong><span className="text-xs text-slate-500">Pantry staples & essentials</span></div><div className="bg-white px-5 py-5 text-center"><strong className="block text-sm font-black text-[#10231a]">Direct ordering</strong><span className="text-xs text-slate-500">WhatsApp or phone</span></div><div className="bg-white px-5 py-5 text-center"><strong className="block text-sm font-black text-[#10231a]">Human support</strong><span className="text-xs text-slate-500">Ask before you buy</span></div><div className="bg-white px-5 py-5 text-center"><strong className="block text-sm font-black text-[#10231a]">Fresh discovery</strong><span className="text-xs text-slate-500">Popular picks & new finds</span></div></div></section>

      <section id="categories" className="enkays-section mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20"><div className="flex items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Shop by need</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10231a] sm:text-4xl">Foodstuff categories</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Find the staples you already love, then message us to confirm availability and order.</p></div><Link href="/products" className="hidden rounded-full border border-emerald-900/10 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 sm:block">View all</Link></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{categories.map((category) => <Link key={category.id} href={`/shop/${category.slug}`} className="enkays-card rounded-3xl border border-emerald-950/5 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-lg text-emerald-700">✦</span><h3 className="mt-7 font-extrabold text-[#10231a]">{category.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{category.description ?? "Everyday food essentials selected for you."}</p></Link>)}</div></section>

      <section id="popular" className="enkays-section bg-white py-14 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Popular now</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10231a] sm:text-4xl">What people are looking for</h2></div><Link href="/products" className="rounded-full border border-emerald-900/10 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">Shop everything</Link></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => { const image = product.images[0]; const url = whatsapp ? whatsappUrl(whatsapp, `Hello Enkays Foods & More, I’m interested in ${product.name}. Is it available?`) : `/products/${product.slug}`; return <article key={product.id} className="enkays-card overflow-hidden rounded-3xl border border-slate-200 bg-white"><Link href={`/products/${product.slug}`} className="block"><div className="relative aspect-square overflow-hidden bg-slate-100">{image ? <Image src={image.secureUrl} alt={image.alt ?? product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-500 hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-sm font-bold text-slate-400">ENKAYS</div>} {product.featured && <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#173223]">Popular</span>}</div><div className="p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{product.category?.name ?? "Foodstuff"}</p><h3 className="mt-1 line-clamp-2 min-h-10 font-extrabold text-[#10231a]">{product.name}</h3><p className="mt-3 text-base font-black text-[#10231a]">{money(product.price)}</p></div></Link>{whatsapp && <div className="px-4 pb-4"><a href={url} className="block rounded-full bg-[#0b4631] px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#073523]">Order on WhatsApp</a></div>}</article>; })}</div></div></section>

      <section className="enkays-section mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20"><div className="relative overflow-hidden rounded-[2rem] bg-[#10231a] px-6 py-10 text-white shadow-2xl sm:px-10"><div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-300/10 blur-3xl" /><div className="relative lg:flex lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Need something specific?</p><h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Tell Enkays what you need. We’ll help you find it.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">No complicated checkout. Send a message or call, confirm availability and order directly.</p></div><div className="mt-7 flex flex-wrap gap-3 lg:mt-0">{phone && <CallOrderButton phoneNumber={phone} />}{whatsapp && <a href={whatsappUrl(whatsapp, "Hello Enkays Foods & More, I need help finding a food item.")} className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-[#08271b] transition hover:bg-emerald-200">Chat on WhatsApp</a>}</div></div></div></section>

      <footer className="border-t border-slate-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 text-sm text-slate-500 sm:px-8 sm:flex-row sm:items-center sm:justify-between"><strong className="text-[#10231a]">{SITE_NAME}</strong><span>{SITE_TAGLINE}</span></div></footer>
      {(phone || whatsapp) && <div className="enkays-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-emerald-950/10 bg-white/95 px-4 pt-3 shadow-[0_-10px_35px_rgba(6,41,29,.12)] backdrop-blur md:hidden"><div className="mx-auto flex max-w-md gap-2">{phone && <CallOrderButton phoneNumber={phone} />}{whatsapp && <a href={whatsappUrl(whatsapp, directMessage)} className="flex-1 rounded-full bg-[#0b4631] px-4 py-3 text-center text-sm font-black text-white">Order on WhatsApp</a>}</div></div>}
    </main>
  );
}
