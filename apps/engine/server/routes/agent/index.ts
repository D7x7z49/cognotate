// apps/engine/server/routes/agent/index.ts

import { Elysia, t } from "elysia";
import { authMiddleware } from "@/server/middleware/auth";
import { AgentModel } from "./model";
import { Agent } from "./service";
import { getProviderModelMatrix } from "@cognotate/core/lib/config";

export const agentRoute = new Elysia({ name: "routes/agent" })
  .use(authMiddleware)
  .group("/agent", (app) =>
    app
      .get(
        "/list",
        async ({ query }) => {
          const response = await Agent.list(query);
          return response;
        },
        {
          query: AgentModel.listQuery,
          response: {
            200: AgentModel.listResponse,
          },
        },
      )
      .put(
        "/model/update",
        async ({ body }) => {
          const response = await Agent.updateModel(body);
          return response;
        },
        {
          isAuth: true,
          body: AgentModel.updateModelBody,
          response: {
            200: AgentModel.updateModelResponse,
          },
        },
      )
      .get(
        "/prompt/export",
        async ({ query }) => {
          return Agent.exportPrompt(query);
        },
        {
          isAuth: true,
          query: AgentModel.exportPromptQuery,
          response: {
            200: AgentModel.exportPromptResponse,
          },
        },
      )
      .put(
        "/prompt/import",
        async ({ body }) => {
          return Agent.importPrompt(body);
        },
        {
          isAuth: true,
          body: AgentModel.importPromptBody,
          response: {
            200: AgentModel.importPromptResponse,
          },
        },
      ),
  )
  .get(
    "/model/list",
    async () => {
      const response = await getProviderModelMatrix();
      return response;
    },
    {
      response: {
        200: t.Array(
          t.Object({
            provider: t.String(),
            models: t.Array(t.String()),
          }),
        ),
      },
    },
  );
