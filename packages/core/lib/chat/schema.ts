// packages/core/lib/chat/schema.ts

import { z } from "zod";

export const CreateChatSchema = z.object({
  nickname: z.string().min(1),
  type: z.enum(["PRIVATE", "GROUP"]),
  description: z.string().optional(),
  membersLimit: z.number().int().positive().optional(),
  metadata: z.json().optional(),
});

export type CreateChatInput = z.infer<typeof CreateChatSchema>;
