import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
} catch (error) {
  console.error("PRISMA_INIT_ERROR", error);
  // Fallback for build time
  prismaInstance = new Proxy({} as PrismaClient, {
    get: () => {
      throw new Error("Prisma client accessed during build or failed to initialize.");
    },
  });
}

export const prisma = prismaInstance;


