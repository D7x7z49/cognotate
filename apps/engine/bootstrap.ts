// apps/engine/bootstrap.ts

import { getConfig, ROOT_CONFIG } from "@cognotate/core/lib/config";
import { cliLogger as logger } from "./lib/logger";

const verifyProviderConfig = async (): Promise<void> => {
  const config = await getConfig();
  if (!config.providers) {
    logger.fail("no providers configured in config file.");
    process.exit(1);
  }

  const nameSet = new Set<string>();
  const duplicates: string[] = [];

  for (const provider of config.providers) {
    if (nameSet.has(provider.name)) {
      duplicates.push(provider.name);
    } else {
      nameSet.add(provider.name);
    }
  }

  if (duplicates.length > 0) {
    logger.fail(`duplicate provider names detected: ${duplicates.join(", ")}`);
    process.exit(1);
  }
};

export const bootstrap = async (): Promise<void> => {
  const configFile = Bun.file(ROOT_CONFIG);
  if (!(await configFile.exists())) {
    await Bun.write(configFile, "{}");
  }

  await verifyProviderConfig();
};
