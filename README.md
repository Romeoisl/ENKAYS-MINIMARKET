# ENKAYS MINI-MARKETPLACE

Production-oriented Next.js marketplace foundation for ENKAYS.

## Ordering model

ENKAYS uses a direct-contact ordering experience. Customers browse products and order by **WhatsApp** or **phone call**. There is no customer checkout, payment flow, shipping calculator, delivery-zone selector, or online delivery workflow.

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
