import { PrismaClient } from "@prisma/client";

// A single shared Prisma client. Next.js hot-reloads modules in dev, which can
// otherwise open a new DB connection on every reload until Postgres runs out.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
