// apps/cli/lib/logger.ts

import { loglight as logger } from "@cognotate/core/lib/logger";

export const cliLogger = logger.tag("cli");
export const subCommandAuthLogger = cliLogger.tag("auth");
export const subCommandChatLogger = cliLogger.tag("chat");
export const subCommandAgentLogger = cliLogger.tag("agent");
export const subCommandEngineLogger = cliLogger.tag("engine");
