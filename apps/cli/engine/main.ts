// apps/cli/engine/main.ts

import { Elysia } from "elysia";
import { getLogger } from "@cognotate/core/lib/logger";

export const genEngine = async () => {
  const logger = await getLogger();
  const app = new Elysia()
    .decorate("logger", logger)
    .onRequest(({ logger, request }) => {
      logger.info({ method: request.method, url: request.url }, "incoming");
    })
    .onAfterResponse(({ logger, set, request }) => {
      logger.info(
        { method: request.method, url: request.url, status: set.status },
        "completed",
      );
    });

  app.get("/health", () => {
    return { status: "ok" };
  });

  return app;
};
