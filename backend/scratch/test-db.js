const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Testing connection...");
  try {
    const userCount = await prisma.user.count();
    console.log("Connection successful! User count:", userCount);
  } catch (err) {
    console.error("Connection failed!", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
