// apps/cli/commands/engine/stop.ts

import { ENGINE_NAME } from "@cognotate/core/lib/config";
import { existingProcess, clearPidInfo } from "@cognotate/core/lib/process";
import { subCommandEngineLogger as logger } from "@/lib/logger";

export const stopEngineAction = async () => {
  logger.work("Stopping engine...");

  const existing = await existingProcess(ENGINE_NAME);
  if (!existing.existing || !existing.info) {
    logger.fail("Engine is not running.");
    return;
  }

  try {
    process.kill(existing.info.pid);
    // Brief wait to allow graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 100));
    clearPidInfo(ENGINE_NAME);
    logger.find(`Engine stopped successfully (PID: ${existing.info.pid}).`);
  } catch (error) {
    logger.fail(
      `Failed to stop engine: process may be unresponsive or already terminated.`,
    );
  }
};
