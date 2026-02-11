// packages/core/lib/llm/secret.ts

import z from "zod";
import { ROOT_SECRET } from "@/lib/config";
import { PROVIDER_LIST, type ProviderValue } from "./constants";

const SecretSchema = z.object({
  [PROVIDER_LIST.OPENAI]: z.string().optional(),
  [PROVIDER_LIST.ANTHROPIC]: z.string().optional(),
  [PROVIDER_LIST.GOOGLE]: z.string().optional(),
  [PROVIDER_LIST.XAI]: z.string().optional(),
  [PROVIDER_LIST.DEEPSEEK]: z.string().optional(),
  [PROVIDER_LIST.OPENROUTER]: z.string().optional(),
});

export type SecretInfo = z.infer<typeof SecretSchema>;

const readSecretFile = async (): Promise<SecretInfo> => {
  const file = Bun.file(ROOT_SECRET);
  return (await file.exists()) ? await file.json() : {};
};

export const getProviderKeys = async (): Promise<SecretInfo> => {
  const secrets: SecretInfo = {};

  const content = await readSecretFile();
  for (const key of Object.values(PROVIDER_LIST) as ProviderValue[]) {
    if (Bun.env[key.toUpperCase() + "_API_KEY"]) {
      secrets[key] = Bun.env[key.toUpperCase() + "_API_KEY"];
    }

    if (content[key]) {
      secrets[key] = content[key];
    }
  }

  return SecretSchema.parse(secrets);
};

export const saveProviderKeys = async (secrets: SecretInfo): Promise<void> => {
  const content = await readSecretFile();

  const newContent = { ...content, ...secrets };
  await Bun.write(ROOT_SECRET, JSON.stringify(newContent, null, 2));
};
