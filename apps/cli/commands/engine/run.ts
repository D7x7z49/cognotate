// apps/cli/commands/engine/run.ts

import { mkdir } from "fs/promises";
import { ENGINE_NAME, ENGINE_ROOT } from "@cognotate/core/lib/config";
import {
  existingProcess,
  setPidInfo,
  clearPidInfo,
} from "@cognotate/core/lib/process";
import { subCommandEngineLogger as logger } from "@/lib/logger";

export const runEngineAction = async (options?: { restart?: boolean }) => {
  try {
    logger.step("Starting engine...");

    const existing = await existingProcess(ENGINE_NAME);
    if (existing.existing && existing.info) {
      if (!options?.restart) {
        logger.fail(
          `Engine is already running (PID: ${existing.info.pid}). Use --restart to force restart.`,
        );
        process.exit(1);
      } else {
        logger.work("Restarting engine...");
        try {
          process.kill(existing.info.pid);
          clearPidInfo(ENGINE_NAME);
        } catch (error) {
          logger.warn(`Failed to kill existing process: ${error}`);
        }
      }
    }

    const engineUrl = import.meta.resolve("@/engine/index");
    const enginePath = Bun.fileURLToPath(engineUrl);

    await mkdir(ENGINE_ROOT, { recursive: true });

    const proc = Bun.spawn({
      cmd: [process.execPath, enginePath],
      detached: true,
      argv0: ENGINE_NAME,
      stdio: ["ignore", "ignore", "ignore"] as const,
      cwd: ENGINE_ROOT,
      env: process.env,
    });

    proc.unref();

    setPidInfo({ name: ENGINE_NAME, pid: proc.pid!, startTime: Date.now() });

    logger.find(`Engine started successfully with PID: ${proc.pid}`);
  } catch (error) {
    logger.fail(`Failed to start engine: ${error}`);
    clearPidInfo(ENGINE_NAME);
    process.exit(1);
  }
};
