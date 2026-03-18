// apps/engine/commands/server/status.ts

import { ENGINE_NAME } from "@cognotate/core/lib/config";
import { existingProcess } from "@cognotate/core/lib/process";
import { cliLogger as logger } from "@/lib/logger";

export const ACTION = "Display Cognotate Engine status";

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export const statusAction = async () => {
  logger.sect(ACTION);

  logger.step("checking engine status.");
  const existing = await existingProcess(ENGINE_NAME);
  if (existing.existing && existing.info) {
    try {
      process.kill(existing.info.pid, 0);
      logger.find(`engine is running (PID: ${existing.info.pid}).`);

      const startTime = existing.info.startTime;
      const uptimeMs = Date.now() - startTime;
      const uptimeStr = formatUptime(uptimeMs);

      logger.find(
        `engine started at ${new Date(startTime).toISOString()} (ISO).`,
      );
      logger.find(`engine has been running for ${uptimeStr}.`);
    } catch (error) {
      logger.find("engine pid file exists, but process is not running.");
    }
  } else {
    logger.find("engine is not running.");
  }

  logger.done(ACTION);
};
