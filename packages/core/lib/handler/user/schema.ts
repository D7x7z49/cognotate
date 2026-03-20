// packages/core/lib/handler/user/schema.ts

import { z } from "zod";
import { UserType } from "@/generated/prisma/client";
import { LIST_LIMIT_DEFAULT, LIST_LIMIT_MAX } from "./constants";

export const listUserSchema = z.object({
  // pagination
  take: z.number().min(1).max(LIST_LIMIT_MAX).default(LIST_LIMIT_DEFAULT),
  skip: z.number().min(0).optional(),
  cursor: z.string().optional(),
  // sorting
  orderBy: z.enum(["createdAt", "updatedAt", "nickname"]).default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
  // filtering
  type: z.enum(UserType).optional(),
});

export type ListUserInput = z.infer<typeof listUserSchema>;
