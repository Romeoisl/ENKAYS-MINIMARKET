# Enkays Foods & More

A modern foodstuff storefront for quality pantry essentials, grains, staples, oils, spices and everyday favourites.

## Ordering model

Enkays uses a direct-contact ordering experience. Customers browse foodstuff and order by **WhatsApp** or **phone call**. There is no customer checkout, payment flow, cart workflow, shipping calculator, delivery-zone selector, or online delivery workflow.

## Brand direction

The website is intentionally food-first rather than mini-market-first. The storefront is designed around discoverability, social sharing, SEO, strong product presentation and fast WhatsApp/phone conversion, with a modern futuristic visual language that keeps food and products at the centre.

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

`SEED_ADMIN_PASSWORD` must be supplied in the environment and contain at least 12 characters. Seed data is demo data only; it does not represent real transactions or inventory.

## Architecture

The website, future mobile client, database, media layer, and APIs are designed as a shared commerce platform. Mobile clients must use the versioned backend APIs and must never connect directly to PostgreSQL.
