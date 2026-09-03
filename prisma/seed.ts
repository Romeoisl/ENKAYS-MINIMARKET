// DEMO / SEED DATA ONLY — clearly not real transactions or real inventory.
import { PrismaClient, Role, ProductStatus, SalesMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user ---
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@enkays.demo" },
    update: {},
    create: {
      name: "ENKAYS Super Admin",
      email: "admin@enkays.demo",
      passwordHash,
      role: Role.SUPER_ADMIN,
      active: true,
    },
  });

  // --- Site settings ---
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "ENKAYS MINI-MARKETPLACE",
      whatsappNumber: "2348000000000", // DEMO NUMBER — replace in admin settings
      supportEmail: "support@enkays.demo",
      seoTitle: "ENKAYS MINI-MARKETPLACE — Shop Online",
      seoDescription:
        "Shop products at ENKAYS MINI-MARKETPLACE. Discover great products, browse categories, and order conveniently online or through WhatsApp.",
    },
  });

  // --- Categories ---
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics", position: 1 },
  });
  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: { name: "Fashion", slug: "fashion", position: 2 },
  });
  const home = await prisma.category.upsert({
    where: { slug: "home-living" },
    update: {},
    create: { name: "Home & Living", slug: "home-living", position: 3 },
  });

  // --- Brands ---
  const brandA = await prisma.brand.upsert({
    where: { slug: "novatech" },
    update: {},
    create: { name: "NovaTech", slug: "novatech" },
  });
  const brandB = await prisma.brand.upsert({
    where: { slug: "urban-fit" },
    update: {},
    create: { name: "Urban Fit", slug: "urban-fit" },
  });

  // --- Products (demo data, prices in kobo) ---
  const demoProducts = [
    {
      name: "NovaTech Wireless Headphones",
      slug: "novatech-wireless-headphones",
      description:
        "Over-ear wireless headphones with active noise cancellation and 30-hour battery life. DEMO PRODUCT.",
      shortDescription: "Wireless ANC headphones, 30hr battery",
      price: 4500000,
      compareAtPrice: 5500000,
      sku: "WH-001",
      stock: 18,
      categoryId: electronics.id,
      brandId: brandA.id,
      featured: true,
    },
    {
      name: "NovaTech Smartwatch Pro",
      slug: "novatech-smartwatch-pro",
      description:
        "Fitness tracking smartwatch with heart-rate monitor and 7-day battery life. DEMO PRODUCT.",
      shortDescription: "Fitness smartwatch, 7-day battery",
      price: 3200000,
      compareAtPrice: null,
      sku: "SW-002",
      stock: 0,
      categoryId: electronics.id,
      brandId: brandA.id,
      status: ProductStatus.PUBLISHED,
    },
    {
      name: "Urban Fit Everyday Sneakers",
      slug: "urban-fit-everyday-sneakers",
      description:
        "Lightweight everyday sneakers built for comfort and durability. DEMO PRODUCT.",
      shortDescription: "Lightweight everyday sneakers",
      price: 1800000,
      compareAtPrice: 2200000,
      sku: "SNK-010",
      stock: 42,
      categoryId: fashion.id,
      brandId: brandB.id,
      featured: true,
    },
    {
      name: "Urban Fit Denim Jacket",
      slug: "urban-fit-denim-jacket",
      description: "Classic fit denim jacket, unisex sizing. DEMO PRODUCT.",
      shortDescription: "Classic fit denim jacket",
      price: 2500000,
      compareAtPrice: null,
      sku: "JKT-011",
      stock: 12,
      categoryId: fashion.id,
      brandId: brandB.id,
    },
    {
      name: "Ceramic Dinnerware Set (16-piece)",
      slug: "ceramic-dinnerware-set-16pc",
      description:
        "16-piece ceramic dinnerware set for 4, dishwasher and microwave safe. DEMO PRODUCT.",
      shortDescription: "16-piece ceramic dinnerware set",
      price: 3800000,
      compareAtPrice: 4300000,
      sku: "HM-020",
      stock: 7,
      categoryId: home.id,
      brandId: null,
      featured: true,
    },
    {
      name: "Aroma Diffuser & Humidifier",
      slug: "aroma-diffuser-humidifier",
      description:
        "300ml ultrasonic aroma diffuser with 7-color LED mood lighting. DEMO PRODUCT.",
      shortDescription: "300ml ultrasonic diffuser",
      price: 950000,
      compareAtPrice: null,
      sku: "HM-021",
      stock: 25,
      categoryId: home.id,
      brandId: null,
    },
  ];

  for (const p of demoProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        sku: p.sku,
        stock: p.stock,
        status: p.stock === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.PUBLISHED,
        published: true,
        featured: (p as any).featured ?? false,
        salesMethod: SalesMethod.WHATSAPP,
        categoryId: p.categoryId,
        brandId: p.brandId ?? undefined,
      },
    });

    await prisma.productImage.upsert({
      where: { id: `${product.id}-primary` },
      update: {},
      create: {
        id: `${product.id}-primary`,
        productId: product.id,
        publicId: `demo/${p.slug}`,
        url: `https://res.cloudinary.com/demo/image/upload/${p.slug}.jpg`,
        secureUrl: `https://res.cloudinary.com/demo/image/upload/${p.slug}.jpg`,
        alt: p.name,
        position: 0,
      },
    });
  }

  console.log("Seed complete: demo admin, categories, brands, products created.");
  console.log("Admin login: admin@enkays.demo / ChangeMe123! (change immediately)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
