// packages/core/lib/llm/hub.ts

import { createProviderRegistry } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createXai } from "@ai-sdk/xai";
import { PROVIDER_LIST, type ProviderValue } from "./constants";
import { getProviderKeys } from "./secret";

type ProviderHub = ReturnType<typeof createProviderRegistry>;

declare global {
  var __cognotate_provider_hub:
    | {
        current: ProviderHub | undefined;
        promise: Promise<ProviderHub> | null;
      }
    | undefined;
}

const getProviderHubState = () => {
  if (!globalThis.__cognotate_provider_hub) {
    globalThis.__cognotate_provider_hub = {
      current: undefined,
      promise: null,
    };
  }
  return globalThis.__cognotate_provider_hub;
};

const PROVIDER_CREATORS = {
  [PROVIDER_LIST.OPENAI]: createOpenAI,
  [PROVIDER_LIST.ANTHROPIC]: createAnthropic,
  [PROVIDER_LIST.GOOGLE]: createGoogleGenerativeAI,
  [PROVIDER_LIST.XAI]: createXai,
  [PROVIDER_LIST.DEEPSEEK]: createDeepSeek,
  [PROVIDER_LIST.OPENROUTER]: createOpenRouter,
} as const;

const loadHub = async (): Promise<ProviderHub> => {
  const keys = await getProviderKeys();

  const entries = Object.entries(PROVIDER_CREATORS)
    .flatMap(([id, genProvider]) => {
      const apiKey = keys[id as ProviderValue];
      if (!apiKey) return [];
      const provider = genProvider({ apiKey });
      return provider ? [[id, provider]] : [];
    })
    .filter(Boolean);

  return createProviderRegistry(Object.fromEntries(entries));
};

const getProviderHub = (force = false): Promise<ProviderHub> => {
  const state = getProviderHubState();

  if (!force && state.current) {
    return Promise.resolve(state.current);
  }

  if (!state.promise || force) {
    state.promise = (async () => {
      const hub = await loadHub();
      state.current = hub;
      state.promise = null;
      return hub;
    })();
  }
  return state.promise;
};

const refreshProviderHub = async (): Promise<ProviderHub> => {
  return getProviderHub(true);
};

export { getProviderHub, refreshProviderHub };
