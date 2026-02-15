// apps/cli/commands/engine/status.ts

import { ENGINE_NAME } from "@cognotate/core/lib/config";
import { existingProcess } from "@cognotate/core/lib/process";
import { subCommandEngineLogger as logger } from "@/lib/logger";

export const statusEngineAction = async () => {
  logger.work("Checking engine status...");

  const existing = await existingProcess(ENGINE_NAME);
  if (existing.existing && existing.info) {
    // Basic health check: try sending signal 0 to verify process exists
    try {
      process.kill(existing.info.pid, 0);
      logger.find(
        `Engine is running (PID: ${existing.info.pid}, started: ${new Date(existing.info.startTime).toISOString()}).`,
      );
    } catch {
      logger.find("Engine PID exists but process is not responding.");
    }
  } else {
    logger.find("Engine is not running.");
  }
};
