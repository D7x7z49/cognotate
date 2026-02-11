// packages/core/lib/config/schema.ts

import { z } from "zod";

//================================
// Info Configurations
//================================

const InfoConfigSchema = z.object({
  root: z.string(),
  project: z
    .object({
      identity: z.string(),
      name: z.string(),
      path: z.string(),
    })
    .optional(),
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
// Database Configurations
//================================

export const DatabaseConfigSchema = z.object({
  // local use SQLite
  local: z.string(),
  // remote use PostgreSQL, using apps/server works with multiple remote DBs
  remote: z.array(z.string()).optional(),
});

//================================
// Server Configurations
//================================
const ServerConfigSchema = z.object({
  port: z.number().optional(),
});

//================================
// Main Config Schema
//================================

export const ConfigSchema = z.object({
  info: InfoConfigSchema.optional(),
  network: NetworkConfigSchema.optional(),
  database: DatabaseConfigSchema.optional(),
  server: ServerConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type ReturnConfig = Required<Config>;
