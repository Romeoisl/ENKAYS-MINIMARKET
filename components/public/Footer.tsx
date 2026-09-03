import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-ink-500">
        <p className="font-semibold text-ink-700">{SITE_NAME}</p>
        <p className="mt-2 max-w-md">
          A modern marketplace focused on convenience, trust, and easy
          discovery — shop online or order directly on WhatsApp.
        </p>
        <p className="mt-6">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
