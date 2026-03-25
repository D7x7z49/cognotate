// apps/engine/server/middleware/auth/model.ts

import { z } from "zod";
import { getUserByIdSchema } from "@cognotate/core/lib/handler/user";
import { UserSchema } from "@cognotate/core/generated/zod";

export const AuthUserSchema = UserSchema.pick({
  id: true,
  type: true,
  nickname: true,
});

export const AuthModel = {
  signinBody: getUserByIdSchema,
  signinResponse: z.object({
    token: z.string(),
    user: AuthUserSchema,
  }),
} as const;

export type AuthModel = {
  [k in keyof typeof AuthModel]: z.infer<(typeof AuthModel)[k]>;
};
