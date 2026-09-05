// DEMO / SEED DATA ONLY — clearly not real transactions or real inventory.
import { PrismaClient, Role, ProductStatus, SalesMethod, PromotionType, CouponType, ReviewStatus, CmsContentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@enkays.demo" },
    update: {},
    create: { name: "ENKAYS Super Admin", email: "admin@enkays.demo", passwordHash, role: Role.SUPER_ADMIN, active: true },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "ENKAYS MINI-MARKETPLACE",
      whatsappNumber: "2348000000000",
      supportEmail: "support@enkays.demo",
      seoTitle: "ENKAYS MINI-MARKETPLACE — Shop Online",
      seoDescription: "Shop products at ENKAYS MINI-MARKETPLACE. Discover great products, browse categories, and order conveniently online or through WhatsApp.",
      defaultWhatsAppMessage: "Hello, I’m interested in ordering from ENKAYS MINI-MARKETPLACE.",
      orderPrefix: "ENK",
    },
  });

  const electronics = await prisma.category.upsert({ where: { slug: "electronics" }, update: {}, create: { name: "Electronics", slug: "electronics", position: 1 } });
  const fashion = await prisma.category.upsert({ where: { slug: "fashion" }, update: {}, create: { name: "Fashion", slug: "fashion", position: 2 } });
  const home = await prisma.category.upsert({ where: { slug: "home-living" }, update: {}, create: { name: "Home & Living", slug: "home-living", position: 3 } });
  const audio = await prisma.category.upsert({ where: { slug: "audio" }, update: {}, create: { name: "Audio", slug: "audio", parentId: electronics.id, position: 1 } });

  const brandA = await prisma.brand.upsert({ where: { slug: "novatech" }, update: {}, create: { name: "NovaTech", slug: "novatech" } });
  const brandB = await prisma.brand.upsert({ where: { slug: "urban-fit" }, update: {}, create: { name: "Urban Fit", slug: "urban-fit" } });

  const demoProducts = [
    { name: "NovaTech Wireless Headphones", slug: "novatech-wireless-headphones", description: "Over-ear wireless headphones with active noise cancellation and 30-hour battery life. DEMO PRODUCT.", shortDescription: "Wireless ANC headphones, 30hr battery", price: 45000, compareAtPrice: 55000, sku: "WH-001", stock: 18, categoryId: audio.id, brandId: brandA.id, featured: true },
    { name: "NovaTech Smartwatch Pro", slug: "novatech-smartwatch-pro", description: "Fitness tracking smartwatch with heart-rate monitor and 7-day battery life. DEMO PRODUCT.", shortDescription: "Fitness smartwatch, 7-day battery", price: 32000, sku: "SW-002", stock: 0, categoryId: electronics.id, brandId: brandA.id },
    { name: "Urban Fit Everyday Sneakers", slug: "urban-fit-everyday-sneakers", description: "Lightweight everyday sneakers built for comfort and durability. DEMO PRODUCT.", shortDescription: "Lightweight everyday sneakers", price: 18000, compareAtPrice: 22000, sku: "SNK-010", stock: 42, categoryId: fashion.id, brandId: brandB.id, featured: true },
    { name: "Urban Fit Denim Jacket", slug: "urban-fit-denim-jacket", description: "Classic fit denim jacket, unisex sizing. DEMO PRODUCT.", shortDescription: "Classic fit denim jacket", price: 25000, sku: "JKT-011", stock: 12, categoryId: fashion.id, brandId: brandB.id },
    { name: "Ceramic Dinnerware Set (16-piece)", slug: "ceramic-dinnerware-set-16pc", description: "16-piece ceramic dinnerware set for 4, dishwasher and microwave safe. DEMO PRODUCT.", shortDescription: "16-piece ceramic dinnerware set", price: 38000, compareAtPrice: 43000, sku: "HM-020", stock: 7, categoryId: home.id, featured: true },
    { name: "Aroma Diffuser & Humidifier", slug: "aroma-diffuser-humidifier", description: "300ml ultrasonic aroma diffuser with 7-color LED mood lighting. DEMO PRODUCT.", shortDescription: "300ml ultrasonic diffuser", price: 9500, sku: "HM-021", stock: 25, categoryId: home.id },
  ];

  const products = [] as Array<{ id: string; name: string; sku: string }>;
  for (const p of demoProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { price: p.price, compareAtPrice: p.compareAtPrice, stock: p.stock, categoryId: p.categoryId, brandId: p.brandId },
      create: { ...p, status: p.stock === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.PUBLISHED, published: true, salesMethod: SalesMethod.WHATSAPP },
      select: { id: true, name: true, sku: true },
    });
    products.push(product);
    await prisma.productImage.upsert({
      where: { id: `${product.id}-primary` },
      update: {},
      create: { id: `${product.id}-primary`, productId: product.id, publicId: `demo/${p.slug}`, url: `https://res.cloudinary.com/demo/image/upload/${p.slug}.jpg`, secureUrl: `https://res.cloudinary.com/demo/image/upload/${p.slug}.jpg`, alt: p.name, position: 0 },
    });
  }

  const headphones = products.find((p) => p.sku === "WH-001")!;
  await prisma.productVariant.deleteMany({ where: { productId: headphones.id } });
  await prisma.productVariant.createMany({ data: [
    { productId: headphones.id, name: "Color", value: "Black", sku: "WH-001-BLK", price: 45000, stock: 10, options: { color: "Black" } },
    { productId: headphones.id, name: "Color", value: "Silver", sku: "WH-001-SLV", price: 47000, stock: 8, options: { color: "Silver" } },
  ] });

  await prisma.review.deleteMany({ where: { productId: headphones.id } });
  await prisma.review.createMany({ data: [
    { productId: headphones.id, rating: 5, title: "Great sound", content: "Demo review: clear sound and comfortable fit.", verifiedPurchase: true, status: ReviewStatus.APPROVED },
    { productId: headphones.id, rating: 4, title: "Good battery", content: "Demo review: battery life is impressive.", verifiedPurchase: false, status: ReviewStatus.APPROVED },
  ] });

  const startsAt = new Date();
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const promotion = await prisma.promotion.upsert({ where: { id: "demo-promotion" }, update: {}, create: { id: "demo-promotion", name: "Demo Weekend Savings", type: PromotionType.PERCENTAGE, value: 10, startsAt, endsAt, active: true } });
  await prisma.promotionProduct.upsert({ where: { promotionId_productId: { promotionId: promotion.id, productId: headphones.id } }, update: {}, create: { promotionId: promotion.id, productId: headphones.id } });

  const flash = await prisma.flashSale.upsert({ where: { id: "demo-flash-sale" }, update: {}, create: { id: "demo-flash-sale", name: "Demo Flash Sale", campaign: "Development campaign", startsAt, endsAt, active: true } });
  await prisma.flashSaleItem.upsert({ where: { flashSaleId_productId: { flashSaleId: flash.id, productId: headphones.id } }, update: {}, create: { flashSaleId: flash.id, productId: headphones.id, salePrice: 39999, originalPrice: 45000, stockAllocation: 6, quantityLimit: 2 } });

  await prisma.coupon.upsert({ where: { code: "ENKAYS10" }, update: {}, create: { code: "ENKAYS10", type: CouponType.PERCENTAGE, value: 10, minimumOrder: 20000, usageLimit: 100, perCustomerLimit: 1, active: true } });
  await prisma.deliveryZone.upsert({ where: { id: "demo-abuja" }, update: {}, create: { id: "demo-abuja", state: "FCT", city: "Abuja", zone: "Demo Zone", fee: 2500, estimatedDelivery: "1–3 business days", freeDeliveryThreshold: 100000, pickup: true, active: true } });

  const cms = [
    { key: "demo-hero", type: CmsContentType.HERO, title: "Shop smarter with ENKAYS", content: { eyebrow: "DEMO CONTENT", headline: "Great finds, one marketplace", description: "Development content for ENKAYS MINI-MARKETPLACE." }, position: 1 },
    { key: "demo-testimonial", type: CmsContentType.TESTIMONIAL, title: "Demo testimonial", content: { quote: "Demo content only.", author: "Development Customer" }, position: 1 },
    { key: "demo-faq", type: CmsContentType.FAQ, title: "Demo FAQ", content: { question: "How do I order?", answer: "Browse a product and use the available checkout or WhatsApp option." }, position: 1 },
    { key: "demo-about", type: CmsContentType.ABOUT, title: "About ENKAYS", content: { body: "Development content for the ENKAYS MINI-MARKETPLACE brand." }, position: 1 },
  ];
  for (const item of cms) await prisma.cmsContent.upsert({ where: { key: item.key }, update: item, create: item });

  await prisma.auditLog.create({ data: { userId: admin.id, action: "SEED_INITIALIZED", resource: "SEED", metadata: { demo: true } } });
  console.log("Seed complete: development/demo catalogue, CMS, promotions, delivery, review and admin data created.");
  console.log("Demo admin: admin@enkays.demo / ChangeMe123! — change immediately before any non-development use.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
