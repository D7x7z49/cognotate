// packages/database/index.ts

import { getConfig } from "@cognotate/config";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var __cognotate_prisma:
    | {
        current: PrismaClient | undefined;
        promise: Promise<PrismaClient> | null;
      }
    | undefined;
}

const getPrismaState = () => {
  if (!globalThis.__cognotate_prisma) {
    globalThis.__cognotate_prisma = {
      current: undefined,
      promise: null,
    };
  }
  return globalThis.__cognotate_prisma;
};

const getAdapter = async () => {
  const globalConfig = await getConfig();

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
};

const genPrismaClient = async () => {
  const adapter = await getAdapter();

  if (!adapter) {
    throw new Error("No adapter found");
  }

  return new PrismaClient({ adapter });
};

const getPrisma = (force = false): Promise<PrismaClient> => {
  const state = getPrismaState();

  if (!force && state.current) {
    return Promise.resolve(state.current);
  }

  if (!state.promise || force) {
    state.promise = (async () => {
      const prisma = await genPrismaClient();
      state.current = prisma;
      state.promise = null;
      return prisma;
    })();
  }
  return state.promise;
};

const refreshPrisma = async (): Promise<PrismaClient> => {
  return getPrisma(true);
};

export { getPrisma, refreshPrisma };
