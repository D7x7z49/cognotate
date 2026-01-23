// packages/database/index.ts

import { globalConfig } from "@cognotate/config";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

async function getAdapter() {
  if (globalConfig.database.type === "sqlite") {
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({
      url: globalConfig.database.url,
    });

    return adapter;
  }

  if (globalConfig.database.type === "postgres") {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const connectionString = globalConfig.database.url;
    const adapter = new PrismaPg({ connectionString });

    return adapter;
  }
}

async function genPrismaClient() {
  const adapter = await getAdapter();

  if (!adapter) {
    throw new Error("No adapter found");
  }

  return new PrismaClient({ adapter });
}

// Create or reuse the global prisma instance
const prisma = globalThis.__prisma ?? (await genPrismaClient());

// In development, save to global to prevent hot-reloading issues
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
