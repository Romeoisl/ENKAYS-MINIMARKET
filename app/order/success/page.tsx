import Link from "next/link";
export const metadata = { title: "Order received" };
export default function OrderSuccessPage() { return <main className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-4xl font-semibold">Thank you for your order.</h1><p className="mt-3 text-ink-500">We’ll contact you with the next steps.</p><Link href="/products" className="mt-8 inline-block rounded-lg bg-enkays-600 px-5 py-3 text-white">Continue shopping</Link></main>; }
