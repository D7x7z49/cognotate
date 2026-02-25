// packages/core/lib/agent/schema.ts

import { z } from "zod";

export const NetworkPermissionSchema = z.object({
  outbound: z.boolean(),
  domains: z.object({
    whitelist: z.array(z.string()).default([]),
    blacklist: z.array(z.string()).default([]),
  }),
});

export const SystemPermissionSchema = z.object({
  read: z.boolean(),
  write: z.boolean(),
  execute: z.boolean(),
  commands: z.object({
    whitelist: z.array(z.string()).default([]),
    blacklist: z.array(z.string()).default([]),
  }),
});

export const AgentPermissionSchema = z.object({
  network: NetworkPermissionSchema,
  system: SystemPermissionSchema,
});

export type NetworkPermission = z.infer<typeof NetworkPermissionSchema>;
export type SystemPermission = z.infer<typeof SystemPermissionSchema>;
export type AgentPermission = z.infer<typeof AgentPermissionSchema>;

export const InfoAgentSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty"),
});

export type InfoAgentInput = z.infer<typeof InfoAgentSchema>;

export const ListAgentSchema = z.object({
  take: z.number().min(1).max(64).optional().default(16),
  skip: z.number().min(0).optional().default(0),
  orderBy: z.enum(["asc", "desc"]).optional().default("asc"),
  enabled: z.enum(["all", "enabled", "disabled"]).optional().default("all"),
});

export type ListAgentInput = z.infer<typeof ListAgentSchema>;

export const AddAgentSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty"),
  model: z.string().min(1, "Model cannot be empty"),
  profession: AgentPermissionSchema,
});

export type AddAgentInput = z.infer<typeof AddAgentSchema>;

export const UpdateAgentSchema = z.object({
  targetNickname: z.string().min(1, "Target nickname cannot be empty"),
  nickname: z.string().min(1, "Nickname cannot be empty").optional(),
  model: z.string().min(1, "Model cannot be empty").optional(),
  profession: AgentPermissionSchema.optional(),
});

export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
