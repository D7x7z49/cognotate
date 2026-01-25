// packages/config/src/schema.ts

import { z } from "zod";

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

export const ConfigSchema = z.object({
  database: DatabaseConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type ReturnConfig = Required<Config>;
