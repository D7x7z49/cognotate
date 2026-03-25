// apps/engine/server/routes/user/index.ts

import { Elysia } from "elysia";
import { authMiddleware } from "@/server/middleware/auth";
import { UserModel } from "./model";
import { User } from "./service";

export const userRoute = new Elysia({ name: "routes/user" })
  .use(authMiddleware)
  .group("/user", (app) =>
    app
      .get(
        "/list",
        async ({ query }) => {
          const response = await User.list(query);
          return response;
        },
        {
          query: UserModel.listQuery,
          response: {
            200: UserModel.listResponse,
          },
        },
      )
      .post(
        "/add",
        async ({ body }) => {
          const response = await User.add(body);
          return response;
        },
        {
          body: UserModel.addBody,
          response: {
            200: UserModel.addResponse,
          },
        },
      ),
  );
