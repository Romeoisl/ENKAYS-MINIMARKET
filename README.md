# ENKAYS MINI-MARKETPLACE

Production-oriented marketplace foundation for a web storefront and future mobile clients. The web and mobile clients share the versioned API and PostgreSQL database; clients never connect directly to PostgreSQL.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Auth.js, Zod, React Hook Form, Sonner, Lucide and Cloudinary.

## Commerce included
- Product catalogue, categories, brands, variants and media
- Guest cart with persistent HTTP-only session cookie
- Validated checkout/order creation with delivery-zone pricing
- Coupon validation and concurrency-aware stock decrements
- Promotions and flash-sale public feeds
- Reviews, wishlist and analytics APIs
- Admin order management, CMS, promotions, coupons, analytics, customers and delivery zones
- RBAC enforcement on server-side admin operations
- Robots/sitemap generation
- Audit logging foundation and secure media abstraction

## Demo seed
Seed data is development/demo data only. Set `SEED_ADMIN_PASSWORD` to a strong password of at least 12 characters before running `npm run db:seed`. The demo admin email is `admin@enkays.demo`; the password is never stored in this README or source code.

## Verification
GitHub Actions runs Prisma generation/database checks, seed, typecheck, tests, lint and build. Production deployment still requires real production environment variables, database migration, Cloudinary credentials and operational security controls such as rate limiting/WAF/monitoring.
