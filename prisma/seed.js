const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create default settings
  await prisma.setting.upsert({
    where: { key: "MARKUP_PERCENTAGE" },
    update: {},
    create: { key: "MARKUP_PERCENTAGE", value: "500" },
  });

  // Create admin users if not exist
  const admins = [
    { email: "admin@biggestlogs.v2", name: "Super Admin" },
    { email: "afaceabolade@gmail.com", name: "Aface Bolade" }
  ];

  const hashedPassword = await bcrypt.hash("admin123", 10);

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: "ADMIN" },
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: "ADMIN",
        balance: 1000.0,
      },
    });
  }

  console.log("Seed data initialized successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
