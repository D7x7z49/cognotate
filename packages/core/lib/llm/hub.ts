// packages/core/lib/llm/hub.ts

import { createProviderRegistry } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";

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

const PROVIDER_FACTORIES = {
  openai: () => createOpenAI({ apiKey: Bun.env.OPENAI_API_KEY }),
  anthropic: () => createAnthropic({ apiKey: Bun.env.ANTHROPIC_API_KEY }),
  google: () => createGoogleGenerativeAI({ apiKey: Bun.env.GOOGLE_API_KEY }),
  xai: () => createXai({ apiKey: Bun.env.XAI_API_KEY }),
  deepseek: () => createDeepSeek({ apiKey: Bun.env.DEEPSEEK_API_KEY }),
} as const;

const loadHub = async (): Promise<ProviderHub> => {
  const entries = Object.entries(PROVIDER_FACTORIES).flatMap(
    ([key, factory]) => {
      const provider = factory();
      return provider ? [[key, provider]] : [];
    },
  );
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
