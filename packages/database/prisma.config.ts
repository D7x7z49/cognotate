// packages/database/prisma.config.ts

import { getConfig } from "@cognotate/config";
import { defineConfig } from "prisma/config";

const globalConfig = await getConfig();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    url: globalConfig.database.url,
  },
});
