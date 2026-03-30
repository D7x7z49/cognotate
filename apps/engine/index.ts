// apps/engine/index.ts

import { runCLI } from "./main.ts";
import { ROOT } from "@cognotate/core/lib/config";
import { cliLogger as logger } from "@/lib/logger";

if (import.meta.main) {
  logger.log(`[HOME] ${ROOT}`);
  runCLI().catch(console.error);
}
