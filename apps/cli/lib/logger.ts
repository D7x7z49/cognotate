// apps/cli/lib/logger.ts

import { loglight as logger } from "@cognotate/core/lib/logger";

export const cliLogger = logger.tag("cli");
export const subCommandAgentLogger = cliLogger.tag("agent");
export const subCommandEngineLogger = cliLogger.tag("engine");

export const engineLogger = cliLogger.tag("engine");
