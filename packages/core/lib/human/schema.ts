// packages/core/lib/human/schema.ts

import { z } from "zod";

export const InfoHumanByIdSchema = z.object({
  id: z.string().min(1, "ID cannot be empty"),
});

export type InfoHumanByIdInput = z.infer<typeof InfoHumanByIdSchema>;

export const InfoHumanByHostNicknameSchema = z.object({
  host: z.string().min(1, "Host cannot be empty"),
  nickname: z.string().min(1, "Nickname cannot be empty"),
});

export type InfoHumanByHostNicknameInput = z.infer<
  typeof InfoHumanByHostNicknameSchema
>;

export const ListHumanSchema = z.object({
  take: z.number().min(1).max(64).optional().default(16),
  skip: z.number().min(0).optional().default(0),
  orderBy: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type ListHumanInput = z.infer<typeof ListHumanSchema>;

export const AddHumanSchema = z.object({
  host: z.string().min(1, "Host cannot be empty"),
  nickname: z.string().min(1, "Nickname cannot be empty"),
});

export type AddHumanInput = z.infer<typeof AddHumanSchema>;
