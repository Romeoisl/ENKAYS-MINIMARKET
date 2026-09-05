import test from "node:test";
import assert from "node:assert/strict";
import { db } from "@/lib/db";

test("PostgreSQL connection", { skip: !process.env.DATABASE_URL }, async () => {
  await db.$queryRaw`SELECT 1`;
  assert.ok(true);
});
