// DEMO / SEED DATA ONLY — clearly not real transactions or real inventory.
import { PrismaClient, Role, ProductStatus, SalesMethod, PromotionType, CouponType, ReviewStatus, CmsContentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const image = (slug: string) => `https://res.cloudinary.com/demo/image/upload/${slug}.jpg`;

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be set and contain at least 12 characters");
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const admin = await prisma.user.upsert({ where: { email: "admin@enkays.demo" }, update: { passwordHash }, create: { name: "Enkays Super Admin", email: "admin@enkays.demo", passwordHash, role: Role.SUPER_ADMIN, active: true } });

  await prisma.siteSettings.upsert({ where: { id: 1 }, update: { siteName: "Enkays Foods & More", seoTitle: "Enkays Foods & More — Quality Foodstuff", seoDescription: "Quality foodstuff, pantry essentials and everyday staples. Order directly through WhatsApp or phone.", defaultWhatsAppMessage: "Hello, I’m interested in ordering from Enkays Foods & More." }, create: { id: 1, siteName: "Enkays Foods & More", whatsappNumber: "2348000000000", phoneNumber: "+2348000000000", supportEmail: "support@enkays.demo", seoTitle: "Enkays Foods & More — Quality Foodstuff", seoDescription: "Quality foodstuff, pantry essentials and everyday staples. Order directly through WhatsApp or phone.", defaultWhatsAppMessage: "Hello, I’m interested in ordering from Enkays Foods & More.", orderPrefix: "ENK" } });

  const categoryData = [
    ["Rice & Grains", "rice-grains", "Rice, grains and everyday staples."],
    ["Beans & Legumes", "beans-legumes", "Beans and protein-rich pantry staples."],
    ["Garri & Cassava", "garri-cassava", "Garri and cassava-based favourites."],
    ["Oils & Cooking", "oils-cooking", "Cooking oils and kitchen essentials."],
    ["Flour & Baking", "flour-baking", "Flour, baking and pantry essentials."],
    ["Spices & Seasonings", "spices-seasonings", "Seasonings and flavours for everyday cooking."],
    ["Canned & Packaged", "canned-packaged", "Convenient packaged food essentials."],
    ["Breakfast & Pantry", "breakfast-pantry", "Breakfast favourites and pantry staples."],
  ] as const;
  const categories = new Map<string, string>();
  for (let i = 0; i < categoryData.length; i++) {
    const [name, slug, description] = categoryData[i];
    const c = await prisma.category.upsert({ where: { slug }, update: { name, description, active: true, position: i + 1 }, create: { name, slug, description, active: true, position: i + 1 } });
    categories.set(slug, c.id);
  }

  const brandData = [
    ["ENKAYS Foods & More", "enkays-foods-more", "ENKAYS house brand."],
    ["Golden Penny", "golden-penny", "Food and pantry products."],
    ["Honeywell", "honeywell", "Food and pantry products."],
    ["Dangote", "dangote", "Food and pantry products."],
  ] as const;
  for (const [name, slug, description] of brandData) {
    await prisma.brand.upsert({
      where: { slug },
      update: { name, description, active: true },
      create: { name, slug, description, active: true },
    });
  }

  const products = [
    ["Premium Long Grain Rice", "premium-long-grain-rice", "Quality long grain rice for everyday family meals.", 6500000, "RICE-001", "rice-grains"],
    ["Honey Beans", "honey-beans", "Clean, tasty beans for soups, stews and classic Nigerian meals.", 4800000, "BEAN-001", "beans-legumes"],
    ["Premium Garri", "premium-garri", "Crisp, clean garri for drinking, snacks and everyday meals.", 3200000, "GAR-001", "garri-cassava"],
    ["Pure Vegetable Oil", "pure-vegetable-oil", "Everyday cooking oil for your kitchen essentials.", 5200000, "OIL-001", "oils-cooking"],
    ["All-Purpose Flour", "all-purpose-flour", "Versatile flour for baking, frying and home cooking.", 3500000, "FLR-001", "flour-baking"],
    ["Kitchen Seasoning Mix", "kitchen-seasoning-mix", "Balanced seasoning for everyday Nigerian cooking.", 1800000, "SPC-001", "spices-seasonings"],
    ["Tomato Paste Pack", "tomato-paste-pack", "Convenient tomato paste for sauces, rice and stews.", 2200000, "CAN-001", "canned-packaged"],
    ["Breakfast Cereal", "breakfast-cereal", "A convenient breakfast favourite for busy mornings.", 4200000, "BRK-001", "breakfast-pantry"],
  ] as const;
  const created = [] as Array<{ id: string; name: string }>;
  for (const [name, slug, description, price, sku, categorySlug] of products) {
    const p = await prisma.product.upsert({ where: { slug }, update: { name, description, price, stock: 25, categoryId: categories.get(categorySlug), published: true, status: ProductStatus.PUBLISHED, salesMethod: SalesMethod.WHATSAPP }, create: { name, slug, description, price, sku, stock: 25, categoryId: categories.get(categorySlug), published: true, status: ProductStatus.PUBLISHED, salesMethod: SalesMethod.WHATSAPP } });
    created.push({ id: p.id, name: p.name });
    await prisma.productImage.upsert({ where: { id: `${p.id}-primary` }, update: { url: image(slug), secureUrl: image(slug), alt: name }, create: { id: `${p.id}-primary`, productId: p.id, publicId: `demo/${slug}`, url: image(slug), secureUrl: image(slug), alt: name, position: 0 } });
  }

  const first = created[0];
  if (first) {
    await prisma.review.deleteMany({ where: { productId: first.id } });
    await prisma.review.create({ data: { productId: first.id, rating: 5, title: "Great quality", content: "Demo review: clean, reliable quality and great for everyday meals.", verifiedPurchase: true, status: ReviewStatus.APPROVED } });
    const startsAt = new Date();
    const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const promotion = await prisma.promotion.upsert({ where: { id: "demo-promotion" }, update: { name: "Food Essentials Savings", active: true }, create: { id: "demo-promotion", name: "Food Essentials Savings", type: PromotionType.PERCENTAGE, value: 10, startsAt, endsAt, active: true } });
    await prisma.promotionProduct.upsert({ where: { promotionId_productId: { promotionId: promotion.id, productId: first.id } }, update: {}, create: { promotionId: promotion.id, productId: first.id } });
    const flash = await prisma.flashSale.upsert({ where: { id: "demo-flash-sale" }, update: {}, create: { id: "demo-flash-sale", name: "Pantry Flash Sale", campaign: "Demo campaign", startsAt, endsAt, active: true } });
    await prisma.flashSaleItem.upsert({ where: { flashSaleId_productId: { flashSaleId: flash.id, productId: first.id } }, update: {}, create: { flashSaleId: flash.id, productId: first.id, salePrice: 5990000, originalPrice: 6500000, stockAllocation: 10, quantityLimit: 3 } });
  }
  await prisma.coupon.upsert({ where: { code: "ENKAYS10" }, update: {}, create: { code: "ENKAYS10", type: CouponType.PERCENTAGE, value: 10, minimumOrder: 2000000, usageLimit: 100, perCustomerLimit: 1, active: true } });

  const cms = [
    { key: "demo-hero", type: CmsContentType.HERO, title: "Quality foodstuff, made easy", content: { eyebrow: "ENKAYS FOODS & MORE", headline: "Your everyday food essentials, sorted.", description: "Quality pantry staples and foodstuff with direct WhatsApp and phone ordering." }, position: 1 },
    { key: "demo-testimonial", type: CmsContentType.TESTIMONIAL, title: "Demo testimonial", content: { quote: "Great quality and easy to order.", author: "Development Customer" }, position: 1 },
    { key: "demo-faq", type: CmsContentType.FAQ, title: "How do I order?", content: { question: "How do I order?", answer: "Browse a product and order through WhatsApp or phone." }, position: 1 },
    { key: "demo-about", type: CmsContentType.ABOUT, title: "About Enkays Foods & More", content: { body: "A modern foodstuff brand focused on quality everyday essentials and simple direct ordering." }, position: 1 },
  ];
  for (const item of cms) await prisma.cmsContent.upsert({ where: { key: item.key }, update: item, create: item });
  await prisma.auditLog.create({ data: { userId: admin.id, action: "SEED_INITIALIZED", resource: "SEED", metadata: { demo: true, brand: "Enkays Foods & More" } } });
  console.log("Enkays Foods & More demo seed complete.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
