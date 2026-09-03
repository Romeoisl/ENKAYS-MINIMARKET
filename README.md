# ENKAYS MINI-MARKETPLACE

A modern marketplace storefront + admin, built on Next.js App Router,
PostgreSQL/Prisma, Auth.js, and Cloudinary. This is the **core scope**
codebase — see "What's here" and "What's not here yet" below.

## Stack
Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, PostgreSQL,
Auth.js (NextAuth v5), Cloudinary, Zod, sonner.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, AUTH_SECRET, Cloudinary keys
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` for the storefront and
`http://localhost:3000/admin/login` for the admin dashboard.

Seeded admin login: `admin@enkays.demo` / `ChangeMe123!` — **change this
password immediately**, it exists only so you can log in the first time.

Generate `AUTH_SECRET` with:
```bash
openssl rand -base64 32
```

## Database
Any Postgres works — Neon or Supabase free tiers are the fastest way to get
a `DATABASE_URL` without running Postgres locally.

## What's here (core scope)
- Product catalogue (products, images, categories, brands) — real DB-backed
- Homepage, product listing/search, product detail pages
- WhatsApp order button, driven by site settings (never hardcoded)
- Admin login (Auth.js credentials + bcrypt) and dashboard with live counts
- Shared `/api/v1/products`, `/api/v1/products/:slug`, `/api/v1/categories`
- Server-side role/permission guard (`lib/permissions.ts`) — never trust
  frontend-only checks
- Prisma schema also includes Order/OrderItem, Review, WishlistItem,
  ProductVariant, AuditLog, SiteSettings models so the next build phase has
  a foundation to build on

## What's not here yet (next build phases)
Cart + checkout flow, order creation, promotions/flash sales/coupons,
delivery zones, review submission UI, wishlist UI, media library / image
upload UI, CMS/homepage builder, analytics events, audit log writing,
full RBAC UI, SEO sitemap/robots, accessibility pass. The schema and
permission layer are already in place for these — they're additive, not a
rebuild.

## Notes
- Prices are stored in kobo (smallest NGN unit) — see `lib/utils.ts
  formatPrice()`.
- Cloudinary API secret is server-only (`lib/cloudinary.ts`), never sent to
  the client.
- Middleware protects all `/admin/*` routes except `/admin/login`.
