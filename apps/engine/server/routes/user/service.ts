// apps/engine/server/routes/user/service.ts

import { status } from "elysia";
import { addUser, listUser } from "@cognotate/core/lib/handler/user";
import { UserModel } from "./model";

export abstract class User {
  static async list(
    input: UserModel["listQuery"],
  ): Promise<UserModel["listResponse"]> {
    const data = await listUser(input);
    const response = UserModel.listResponse.safeParse(data);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    if (!response.data) {
      throw status(404);
    }
    return response.data;
  }
  static async add(
    input: UserModel["addBody"],
  ): Promise<UserModel["addResponse"]> {
    const data = await addUser(input);
    const response = UserModel.addResponse.safeParse(data);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    if (!response.data) {
      throw status(404);
    }
    return response.data;
  }
}
