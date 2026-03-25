// packages/core/lib/handler/user/schema.ts

import { z } from "zod";
import { UserType } from "@/prisma/client";
import {
  LIST_LIMIT_DEFAULT,
  LIST_LIMIT_MAX,
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH,
} from "./constants";

export const getUserByIdSchema = z.object({
  id: z.string(),
});

export const listUserSchema = z.object({
  // pagination
  take: z.coerce
    .number()
    .min(1)
    .max(LIST_LIMIT_MAX)
    .default(LIST_LIMIT_DEFAULT),
  skip: z.coerce.number().min(0).optional(),
  cursor: z.string().optional(),
  // sorting
  orderBy: z.enum(["createdAt", "updatedAt", "nickname"]).default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
  // filtering
  type: z.enum(UserType).optional(),
});

export const addUserSchema = z.object({
  type: z.enum(UserType),
  nickname: z
    .string()
    .min(USER_NICKNAME_MIN_LENGTH)
    .max(USER_NICKNAME_MAX_LENGTH),
  metadata: z.json().optional().default({}),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type ListUserInput = z.infer<typeof listUserSchema>;
export type AddUserInput = z.infer<typeof addUserSchema>;
