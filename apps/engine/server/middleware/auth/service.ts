// apps/engine/server/middleware/auth/service.ts

import { status } from "elysia";
import { getUserById } from "@cognotate/core/lib/handler/user";
import { AuthModel, AuthUserSchema } from "./model";

export abstract class Auth {
  static async signin(input: AuthModel["signinBody"]) {
    const data = await getUserById(input);
    if (!data) {
      throw status(404, "User not found");
    }
    const result = AuthUserSchema.safeParse(data);
    if (!result.success) {
      throw status(400, result.error.message);
    }
    return result.data;
  }
}
