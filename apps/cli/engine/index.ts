// apps/cli/engine/index.ts

import { join } from "path";
import {
  ENGINE_PORT,
  ENGINE_NAME,
  LOGGER_ROOT,
} from "@cognotate/core/lib/config";
import { clearPidInfo } from "@cognotate/core/lib/process/pid";
import { getLogger } from "@cognotate/core/lib/logger";
import { genEngine } from "./main";

let isShuttingDown = false;

if (import.meta.main) {
  const logger = await getLogger({
    transport: {
      target: "pino-roll",
      options: {
        file: join(LOGGER_ROOT, "engine.log"),
        size: "64M",
        mkdir: true,
        symlink: true,
        limit: { count: 8 },
      },
    },
    formatters: {
      level: (label, _) => {
        return { level: label };
      },
    },
  });
  const app = await genEngine();
  const server = app.listen(ENGINE_PORT, () => {
    logger.info(`[+] engine on port ${ENGINE_PORT}`);
  });

  const shutdown = async (signal?: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`[-] shutting down engine (${signal || "error"})`);
    let exitCode = 0;
    try {
      await server.stop();
      logger.info("[-] engine stopped");
    } catch (err) {
      logger.error(`[!] shutdown failed: ${(err as Error).message}`);
      exitCode = 1;
    } finally {
      if (logger && Symbol.for("pino.stream") in logger) {
        const stream = (logger as any)[Symbol.for("pino.stream")];
        if (stream && !stream.closed) {
          await new Promise<void>((resolve) => {
            stream.once("close", resolve);
            stream.end();
          });
        }
      }
      clearPidInfo(ENGINE_NAME);
      process.exit(exitCode);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    logger.error(`[!] uncaught: ${err.message}`);
    shutdown();
  });
  process.on("unhandledRejection", (reason) => {
    logger.error(`[!] unhandled rejection: ${String(reason)}`);
    shutdown();
  });
}
