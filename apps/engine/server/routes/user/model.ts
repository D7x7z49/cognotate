// apps/engine/server/routes/user/model.ts

import { z } from "zod";
import {
  addUserSchema,
  listUserSchema,
} from "@cognotate/core/lib/handler/user";

import { UserSchema } from "@cognotate/core/generated/zod";

const ShowUserSchema = UserSchema.pick({
  id: true,
  nickname: true,
});

export const UserModel = {
  listQuery: listUserSchema,
  listResponse: z.array(ShowUserSchema),
  addBody: addUserSchema,
  addResponse: ShowUserSchema,
} as const;

export type UserModel = {
  [k in keyof typeof UserModel]: z.infer<(typeof UserModel)[k]>;
};
