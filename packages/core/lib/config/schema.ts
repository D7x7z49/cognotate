// packages/core/lib/config/schema.ts

import { z } from "zod";

//================================
// Info Configurations
//================================

const InfoConfigSchema = z.object({
  root: z.string(),
  project: z.string().optional(),
  identity: z.string().optional(),
});

//================================
// Database Configurations
//================================

const SqliteConfigSchema = z.object({
  type: z.literal("sqlite"),
  url: z.string(),
});

const PostgresConfigSchema = z.object({
  type: z.literal("postgres"),
  url: z.string(),
});

export const DatabaseConfigSchema = z.discriminatedUnion("type", [
  SqliteConfigSchema,
  PostgresConfigSchema,
]);

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
  database: DatabaseConfigSchema.optional(),
  server: ServerConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type ReturnConfig = Required<Config>;
