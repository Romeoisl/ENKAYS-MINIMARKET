import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be set and contain at least 12 characters");
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  await prisma.user.upsert({
    where: { email: "admin@enkays.demo" },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
      active: true,
    },
    create: {
      name: "Enkays Super Admin",
      email: "admin@enkays.demo",
      passwordHash,
      role: Role.SUPER_ADMIN,
      active: true,
    },
  });

  console.log("Production admin seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
