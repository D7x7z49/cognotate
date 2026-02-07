// packages/core/prisma.config.ts

import { getConfig } from "@/lib/config";
import { defineConfig } from "prisma/config";

const globalConfig = await getConfig();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    url: globalConfig.database.local,
  },
});
