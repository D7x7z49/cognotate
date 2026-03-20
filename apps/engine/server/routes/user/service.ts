// apps/engine/server/routes/user/service.ts

import { listUser } from "@cognotate/core/lib/handler/user";
import { UserModel } from "./model";

export abstract class User {
  static async list(input: UserModel["listQuery"]) {
    listUser(input);
  }
  static async add() {}
  static async update() {}
  static async remove() {}
}
