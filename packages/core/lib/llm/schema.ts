// packages/core/lib/llm/schema.ts

import { z } from "zod";
import { PROVIDERS } from "./constants";

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxTokens: z.number(),
});

export const ProviderSchema = z.object({
  name: z.string(),
  type: z.enum(PROVIDERS),
  baseURL: z.string(),
  apiKey: z.string(),
  models: z.array(ModelSchema),
});

export type AgentModel = z.infer<typeof ModelSchema>;
export type AgentProvider = z.infer<typeof ProviderSchema>;
