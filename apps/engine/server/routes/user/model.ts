// apps/engine/server/routes/user/model.ts

import { t, type UnwrapSchema } from "elysia";
import { listUserSchema } from "@cognotate/core/lib/handler/user";

export const UserModel = {
  listQuery: listUserSchema,
} as const;

export type UserModel = {
  [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};
