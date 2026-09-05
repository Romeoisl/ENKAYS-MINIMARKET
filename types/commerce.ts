import type { ProductStatus, SalesMethod, PriceVisibility } from "@prisma/client";

export type ProductApi = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  sku: string;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  published: boolean;
  salesMethod: SalesMethod;
  priceVisibility: PriceVisibility;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; secureUrl: string; position: number; alt: string | null }>;
  variants: Array<{ id: string; name: string; value: string; sku: string | null; price: number | null; stock: number; active: boolean }>;
  rating: number;
  reviewCount: number;
};

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> };
export type ApiFailure = { error: { code: string; message: string; details?: unknown }; requestId: string };
