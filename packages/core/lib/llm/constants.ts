// packages/core/lib/llm/constants.ts

import { CACHE_ROOT } from "@/lib/config";
import { join } from "path";

export const PROVIDER_LIST = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  XAI: "xai",
  DEEPSEEK: "deepseek",
  OPENROUTER: "openrouter",
} as const;

export const PROVIDERS = Object.values(PROVIDER_LIST);

export type ProviderKey = keyof typeof PROVIDER_LIST;
export type ProviderValue = (typeof PROVIDER_LIST)[ProviderKey];

export const PROVIDER_CACHE_ROOT = join(CACHE_ROOT, "providers");
