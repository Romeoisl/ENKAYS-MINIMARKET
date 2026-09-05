"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { SITE_NAME } from "@/lib/constants";

function safeCallbackUrl(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin/dashboard";
  }
  return value;
}

export function AdminLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        return;
      }

      router.push(safeCallbackUrl(callbackUrl));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl2 border border-ink-100 bg-white p-8 shadow-sm"
    >
      <h1 className="text-lg font-bold text-enkays-700">{SITE_NAME} ADMIN</h1>
      <p className="mt-1 text-sm text-ink-500">Sign in to manage the marketplace.</p>

      <label className="mt-6 block text-sm font-medium">Email</label>
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        className="mt-1 w-full rounded-lg border border-ink-100 px-3 py-2 text-sm outline-enkays-500"
      />

      <label className="mt-4 block text-sm font-medium">Password</label>
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="mt-1 w-full rounded-lg border border-ink-100 px-3 py-2 text-sm outline-enkays-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-enkays-600 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
