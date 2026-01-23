// packages/database/prisma.config.ts

import { globalConfig } from "@cognotate/config";
import { defineConfig } from "prisma/config";

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
