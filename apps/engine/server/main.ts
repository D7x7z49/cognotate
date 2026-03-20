// apps/engine/server/main.ts

import { Elysia } from "elysia";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { getLogger } from "@cognotate/core/lib/logger";
import packageInfo from "@/package.json" assert { type: "json" };
import { userRoute } from "./routes";
import { COGNOTATE } from "@cognotate/core/lib/config";

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

  app // use plugin
    .use(serverTiming())
    .use(
      openapi({
        references: fromTypes(),
      }),
    );

  app // set state
    .state("version", packageInfo.version)
    .get(
      "/",
      `This is ${COGNOTATE.charAt(0).toUpperCase() + COGNOTATE.slice(1)}!`,
    )
    .get("/health", ({ store: { version } }) => {
      return {
        version,
        status: "ok",
      };
    });

  app // load routes
    .use(userRoute);

  return app;
};
