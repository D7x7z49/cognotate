// apps/engine/server/main.ts

import { Elysia } from "elysia";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { COGNOTATE } from "@cognotate/core/lib/config";
import { getLogger } from "@cognotate/core/lib/logger";
import { authMiddleware, authRoute } from "./middleware/auth";
import { userRoute } from "./routes";
import packageInfo from "@/package.json" assert { type: "json" };

const getHello = () => {
  return `This is ${COGNOTATE.charAt(0).toUpperCase() + COGNOTATE.slice(1)}!`;
};

export const genEngine = async () => {
  const logger = await getLogger();
  const app = new Elysia({ name: "engine" })
    // loading logger
    .decorate("logger", logger)
    .onRequest(({ logger, request }) => {
      logger.info({ method: request.method, url: request.url }, "incoming");
    })
    .onAfterResponse(({ logger, set, request }) => {
      logger.info(
        { method: request.method, url: request.url, status: set.status },
        "completed",
      );
    })
    // use plugin
    .use(serverTiming())
    .use(
      openapi({
        references: fromTypes(),
      }),
    )
    // set state
    .state("version", packageInfo.version)
    .get("/", getHello)
    .get("/health", ({ store: { version } }) => {
      return {
        version,
        status: "ok",
      };
    })
    // load routes
    .use(authMiddleware)
    .get("/me", ({ user }) => user, { isAuth: true })
    .use(authRoute)
    .use(userRoute);

  return app;
};
