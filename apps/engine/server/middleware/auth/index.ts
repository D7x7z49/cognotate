// apps/engine/server/middleware/auth/index.ts

import { Elysia, status, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { ENGINE_JWT_SECRET } from "@cognotate/core/lib/config";
import { AuthModel } from "./model";
import { Auth } from "./service";

export const authMiddleware = new Elysia({ name: "middleware/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: ENGINE_JWT_SECRET,
    }),
  )
  .use(bearer())
  .macro({
    isAuth: {
      headers: t.Object({
        Authorization: t.Optional(t.String()),
      }),
      cookie: t.Cookie({
        session: t.Optional(t.String()),
      }),
      resolve: async ({ jwt, bearer, cookie }) => {
        // requires Authorization: Bearer <token>
        let token = bearer;
        if (!token && cookie.session?.value) {
          token = cookie.session.value as string;
        }

        if (!token) {
          return status(401, "Missing authentication token");
        }

        const payload = await jwt.verify(token);

        // JWT payload must contain string id
        if (!payload || typeof payload.id !== "string") {
          return status(401, "Invalid or expired token");
        }

        const user = await Auth.signin({ id: payload.id });

        // inject user into context
        return { user };
      },
    },
  })
  // limit context to direct children
  .as("scoped");

export const authRoute = new Elysia().use(authMiddleware).post(
  "/sign/in",
  async ({ body, jwt, cookie: { session } }) => {
    const user = await Auth.signin(body);
    const token = await jwt.sign({
      id: user.id,
      type: user.type,
    });

    session.value = token;

    return { token, user };
  },
  {
    body: AuthModel.signinBody,
    cookie: t.Cookie({
      session: t.Optional(t.String()),
    }),
    response: {
      200: AuthModel.signinResponse,
    },
  },
);

export type { AuthModel } from "./model";
