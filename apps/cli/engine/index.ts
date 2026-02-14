// apps/cli/engine/index.ts

import { engineLogger } from "@/lib/logger";
import { ENGINE_PORT, ENGINE_NAME } from "@cognotate/core/lib/config";
import { clearPidInfo } from "@cognotate/core/lib/process/pid";
import { Elysia } from "elysia";

let isShuttingDown = false;

export const genEngine = async () => {
  const app = new Elysia();

  app.get("/health", () => {
    return { status: "ok" };
  });

  return app;
};

if (import.meta.main) {
  const app = await genEngine();
  const server = app.listen(ENGINE_PORT, () => {
    engineLogger.sect(`engine on port ${ENGINE_PORT}`);
  });

  const shutdown = async (signal?: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    engineLogger.log(`Shutting down engine (${signal || "error"})`);
    let exitCode = 0;
    try {
      await server.stop();
      engineLogger.sect("Engine stopped");
    } catch (err) {
      engineLogger.fail(`Shutdown failed: ${(err as Error).message}`);
      exitCode = 1;
    } finally {
      clearPidInfo(ENGINE_NAME);
      process.exit(exitCode);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    engineLogger.fail(`Uncaught: ${err.message}`);
    shutdown();
  });
  process.on("unhandledRejection", (reason) => {
    engineLogger.fail(`Unhandled rejection: ${String(reason)}`);
    shutdown();
  });
}
