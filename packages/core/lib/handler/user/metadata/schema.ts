// packages/core/lib/handler/user/metadata/schema.ts

import { z } from "zod";

export enum AffinityType {
  EVENT = "EVENT",
  OBJECT = "OBJECT",
  ENTITY = "ENTITY",
}

const AffinityItemSchema = z.object({
  value: z.string(),
  type: z.enum(AffinityType),
});

export const SystemPromptSchema = z.object({
  motto: z.string(),
  name: z.object({
    value: z.string(),
    meaning: z.string(),
  }),
  role: z.object({
    value: z.string(),
    description: z.string(),
  }),
  affinities: z.array(AffinityItemSchema),
  aversions: z.array(AffinityItemSchema),
  experiences: z.array(z.string()),
});

export const AgentMetadataSchema = z.object({
  model: z.string(),
  prompt: SystemPromptSchema,
});

export const UpdateAgentMetadataSchema = z.object({
  id: z.string(),
  metadata: AgentMetadataSchema,
});

export type UpdateAgentMetadataInput = z.infer<
  typeof UpdateAgentMetadataSchema
>;
