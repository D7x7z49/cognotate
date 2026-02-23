// apps/cli/commands/engine/log.ts

import { ENGINE_NAME } from "@cognotate/core/lib/config";
import { existingProcess } from "@cognotate/core/lib/process";
import { subCommandEngineLogger as logger } from "@/lib/logger";
import { LOGGER_ROOT } from "@cognotate/core/lib/config";
import { join } from "path";

export const logEngineAction = async (options?: { lines?: number }) => {
  logger.work("Checking engine logs...");

  const existing = await existingProcess(ENGINE_NAME);
  if (!existing.existing || !existing.info) {
    logger.fail("Engine is not running. Please start the engine first.");
    return;
  }

  const logFile = join(LOGGER_ROOT, "current.log");

  try {
    // Check if log file exists
    const logFileHandle = Bun.file(logFile);
    if (!(await logFileHandle.exists())) {
      logger.fail("Log file not found. Logs may not have been generated yet.");
      return;
    }

    // Read and display log content
    const logContent = await logFileHandle.text();
    const lines = logContent.split("\n").filter((line) => line.trim() !== "");
    const totalLines = lines.length;

    if (totalLines === 0) {
      logger.find("Engine is running but log file is empty.");
      return;
    }

    // Get only the last N lines (default 20)
    const lineCount = options?.lines ?? 20;
    const linesToShow = lines.slice(-lineCount);

    logger.find(`Showing last ${linesToShow.length} of ${totalLines} lines:`);
    console.log(linesToShow.join("\n"));
  } catch (error) {
    logger.fail(`Failed to read engine logs: ${error}`);
  }
};
