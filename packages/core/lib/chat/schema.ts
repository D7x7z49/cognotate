// packages/core/lib/chat/schema.ts

import { z } from "zod";

export const AddChatSchema = z.object({
  nickname: z.string().min(1),
  type: z.enum(["PRIVATE", "GROUP"]),
  description: z.string().optional(),
  membersLimit: z.number().int().positive().optional(),
  metadata: z.json().optional(),
});

export type AddChatInput = z.infer<typeof AddChatSchema>;

export const ListChatSchema = z.object({
  take: z.number().int().positive().default(16),
  skip: z.number().int().nonnegative().default(0),
  orderBy: z.enum(["asc", "desc"]).default("asc"),
});

export type ListChatInput = z.infer<typeof ListChatSchema>;

export const JoinChatSchema = z.object({
  chatNickname: z.string().min(1),
  memberNickname: z.string().min(1),
  human: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
});

export type JoinChatInput = z.infer<typeof JoinChatSchema>;
