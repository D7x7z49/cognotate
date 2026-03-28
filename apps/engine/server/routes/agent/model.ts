// apps/engine/server/routes/agent/model.ts

import { z } from "zod";
import { UserSchema } from "@cognotate/core/generated/zod";
import {
  AgentMetadataSchema,
  listUserSchema,
  SystemPromptSchema,
} from "@cognotate/core/lib/handler/user";

const ListAgentSchema = listUserSchema.omit({
  type: true,
});

const SystemPromptPartialSchema = SystemPromptSchema.partial();
const AgentMetadataPartialSchema = AgentMetadataSchema.extend({
  prompt: SystemPromptPartialSchema,
}).partial({
  model: true,
  prompt: true,
});

const ShowAgentSchema = UserSchema.pick({
  id: true,
  nickname: true,
  type: true,
  metadata: true,
}).extend({
  metadata: AgentMetadataPartialSchema,
});

export const AgentModel = {
  listQuery: ListAgentSchema,
  listResponse: z.array(ShowAgentSchema),
  updateModelBody: z.object({
    id: z.string(),
    model: z.string(),
  }),
  updateModelResponse: ShowAgentSchema,
  exportPromptQuery: z.object({
    id: z.string(),
  }),
  exportPromptResponse: ShowAgentSchema,
  importPromptBody: z.object({
    id: z.string(),
    prompt: SystemPromptPartialSchema,
  }),
  importPromptResponse: ShowAgentSchema,
} as const;

export type AgentModel = {
  [k in keyof typeof AgentModel]: z.infer<(typeof AgentModel)[k]>;
};
