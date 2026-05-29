import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    process.env.NODE_ENV === "production"
      ? {
          log: ["warn", "error"],
        }
      : {
          log: ["query", "warn", "error"],
        }
  );

if (process.env.NODE_ENV === "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
