// apps/engine/commands/server/run.ts
/// apps/engine/commands/server/run.ts

import { mkdir } from "fs/promises";
import { ENGINE_NAME, ENGINE_ROOT } from "@cognotate/core/lib/config";
import {
  clearPidInfo,
  existingProcess,
  setPidInfo,
} from "@cognotate/core/lib/process";
import { cliLogger as logger } from "@/lib/logger";

export const ACTION = "Running Cognotate Engine";

export const runAction = async (options?: { restart?: boolean }) => {
  const restartFlag = options?.restart ?? false;

  logger.sect(ACTION);

  logger.step("running engine.");
  const existing = await existingProcess(ENGINE_NAME);
  if (existing.existing && existing.info) {
    logger.find(`pid file exists (PID: ${existing.info.pid}).`);

    if (!restartFlag) {
      logger.fail("engine is already running.");
      process.exit(1);
    }

    logger.step("restarting engine.");
    try {
      process.kill(existing.info.pid);
      clearPidInfo(ENGINE_NAME);
    } catch (error) {
      logger.fail("failed to kill existing engine process.");
      logger.fail(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  try {
    const engineUrl = import.meta.resolve("@/server/index");
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

    logger.find(`Engine run successfully (PID: ${proc.pid}).`);
  } catch (error) {
    logger.fail("failed to run engine.");
    logger.fail(error instanceof Error ? error.message : String(error));
    clearPidInfo(ENGINE_NAME);
    process.exit(1);
  }

  logger.done(ACTION);
};
