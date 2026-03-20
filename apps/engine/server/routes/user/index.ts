// apps/engine/server/routes/user/index.ts

import { Elysia } from "elysia";
import { UserModel } from "./model";
import { User } from "./service";

export const userRoute = new Elysia().group("/user", (app) =>
  app.get(
    "/list",
    async ({ query }) => {
      return await User.list(query);
    },
    {
      query: UserModel.listQuery,
    },
  ),
);
