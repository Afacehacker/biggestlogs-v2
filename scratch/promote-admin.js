const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "afaceabolade@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log(`User ${email} is now an ADMIN`);
}

main()
  .catch((e) => {
    console.error("Error making user admin:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
