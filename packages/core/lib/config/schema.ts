// packages/core/lib/config/schema.ts

import { z } from "zod";
import { ProviderSchema } from "@/lib/llm/schema";

//================================
// Database Configurations
//================================

export const DatabaseConfigSchema = z.object({
  // local use SQLite
  local: z.string(),
  // remote use PostgreSQL, using apps/server works with multiple remote DBs
  remote: z.array(z.string()).optional(),
});

//================================
// Log Configurations
//================================

const LogConfigSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]),
});

//================================
// Network Configurations
//================================
const NetworkConfigSchema = z.object({
  proxy: z
    .object({
      noProxy: z.array(z.string()).optional(),
      httpProxy: z.string().optional(),
      httpsProxy: z.string().optional(),
      socksProxy: z.string().optional(),
    })
    .optional(),
});

//================================
// Main Config Schema
//================================

export const ConfigSchema = z.object({
  log: LogConfigSchema.optional(),
  database: DatabaseConfigSchema.optional(),
  network: NetworkConfigSchema.optional(),
  providers: z.array(ProviderSchema).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type ReturnConfig = Required<Config>;
