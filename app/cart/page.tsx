import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { CartClient } from "@/components/public/CartClient";

export const metadata = { title: "Your Cart" };
export default function CartPage() { return <div className="flex min-h-screen flex-col"><Navbar /><main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"><h1 className="mb-6 text-3xl font-semibold">Your cart</h1><CartClient /></main><Footer /></div>; }
