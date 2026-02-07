// packages/core/lib/database/index.ts

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getConfig } from "@/lib/config";
import { PrismaClient } from "@/prisma/client";

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

const genPrismaClient = async () => {
  const globalConfig = await getConfig();
  const adapter = new PrismaLibSql({
    url: globalConfig.database.local,
  });

  return new PrismaClient({ adapter });
};

const getPrisma = (): Promise<PrismaClient> => {
  const state = getPrismaState();

  if (state.current) {
    return Promise.resolve(state.current);
  }

  if (!state.promise) {
    state.promise = (async () => {
      const prisma = await genPrismaClient();
      state.current = prisma;
      state.promise = null;
      return prisma;
    })();
  }
  return state.promise;
};

export { getPrisma };
