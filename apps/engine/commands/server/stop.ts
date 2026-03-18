// apps/engine/commands/server/stop.ts

import { ENGINE_NAME } from "@cognotate/core/lib/config";
import { existingProcess, clearPidInfo } from "@cognotate/core/lib/process";
import { cliLogger as logger } from "@/lib/logger";

export const ACTION = "Stop Cognotate Engine";

export const stopAction = async () => {
  logger.sect(ACTION);

  logger.step("checking engine status.");
  const existing = await existingProcess(ENGINE_NAME);
  if (!existing.existing || !existing.info) {
    logger.find("engine is not running.");
    return;
  }

  try {
    process.kill(existing.info.pid);
    // Brief wait to allow graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 100));
    clearPidInfo(ENGINE_NAME);
    logger.find(`engine stopped successfully (PID: ${existing.info.pid}).`);
  } catch (error) {
    logger.fail("failed to kill existing engine process.");
    logger.fail(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  logger.done(ACTION);
};
