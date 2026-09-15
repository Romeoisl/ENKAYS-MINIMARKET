import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { CheckoutClient } from "@/components/public/CheckoutClient";
export const metadata = { title: "Checkout" };
export default function CheckoutPage() { return <div className="flex min-h-screen flex-col"><Navbar /><main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"><h1 className="mb-6 text-3xl font-semibold">Checkout</h1><CheckoutClient /></main><Footer /></div>; }
