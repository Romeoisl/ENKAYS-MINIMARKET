# Prisma migrations

Production schema changes for ENKAYS MINI-MARKETPLACE must be committed as Prisma migration directories generated from a real PostgreSQL connection.

Run locally:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name initial_commerce_foundation
npx prisma db seed
```

For deployment, use `npx prisma migrate deploy` rather than `migrate dev`.

A migration directory is intentionally not fabricated in source control: it must be generated and verified against the target PostgreSQL provider.