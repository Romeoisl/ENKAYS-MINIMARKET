import test from "node:test";
import assert from "node:assert/strict";
import { authLoginSchema, productSchema, productQuerySchema } from "@/lib/validations";
import { hasRole } from "@/lib/permissions";

 test("product validation accepts a valid marketplace product", () => {
  const result = productSchema.safeParse({
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description: "A premium wireless headset.",
    price: 45000,
    sku: "WH-001",
    stock: 18,
  });
  assert.equal(result.success, true);
});

test("product validation rejects malformed slug and negative price", () => {
  const result = productSchema.safeParse({
    name: "Headphones",
    slug: "Not A Slug",
    description: "Product",
    price: -1,
    sku: "WH-001",
    stock: 1,
  });
  assert.equal(result.success, false);
});

test("authentication validation requires a valid email and password", () => {
  assert.equal(authLoginSchema.safeParse({ email: "admin@example.com", password: "secure-pass-123" }).success, true);
  assert.equal(authLoginSchema.safeParse({ email: "bad", password: "short" }).success, false);
});

test("product query validation applies safe pagination defaults", () => {
  const result = productQuerySchema.parse({});
  assert.equal(result.page, 1);
  assert.equal(result.limit, 24);
});

test("role checks enforce hierarchy", () => {
  assert.equal(hasRole("SUPER_ADMIN", "ADMIN"), true);
  assert.equal(hasRole("ADMIN", "EDITOR"), true);
  assert.equal(hasRole("EDITOR", "ADMIN"), false);
});
