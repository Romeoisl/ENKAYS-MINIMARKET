# Enkays Foods & More

Production-oriented Next.js storefront and admin platform for a modern Nigerian foodstuff brand.

## Brand direction

Enkays Foods & More is food-first: grains, beans, garri and cassava products, flour, oils, spices, pantry staples, packaged foods and related everyday essentials. The experience is intentionally premium, modern and lightly futuristic while keeping product discovery and ordering simple.

## Ordering model

Customers browse products and order directly through **WhatsApp or phone call**. There is no public cart, customer checkout, online payment flow, shipping calculator, delivery-zone selector, delivery-address workflow or online delivery process.

Admin users can still maintain internal order records for enquiries and confirmed direct orders.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS + Lucide
- PostgreSQL + Prisma
- Auth.js / NextAuth
- Zod + React Hook Form + Sonner
- Cloudinary media abstraction
- Versioned `/api/v1/*` APIs

## Development

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:seed
npm run typecheck
npm test
npm run lint
npm run build
```

`SEED_ADMIN_PASSWORD` must be supplied in the environment and contain at least 12 characters. Seed data is demo data only and does not represent real transactions or inventory.

## Production direction

The platform is being completed in this order: architecture cleanup, feature completion, security hardening, automated verification, storefront/admin UI transformation, then final regression and deployment readiness.

The website, future mobile client, database, media layer and APIs are designed as a shared commerce platform. Mobile clients must use the versioned backend APIs and must never connect directly to PostgreSQL.

## Deployment

Production deployments are triggered from the `foundation/session-1` branch through Vercel. PostgreSQL is provided by Supabase and product media is handled through Cloudinary.
