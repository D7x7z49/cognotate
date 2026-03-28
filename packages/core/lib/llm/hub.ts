// packages/core/lib/llm/hub.ts

import { createProviderRegistry } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { getConfig } from "@/lib/config";

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

const loadHub = async (): Promise<ProviderHub> => {
  const config = await getConfig();
  if (!config.providers) {
    return createProviderRegistry({});
  }

  const providerMap = config.providers
    .map((provider) => {
      const { name, type, baseURL, apiKey } = provider;
      const info = { baseURL, apiKey };
      switch (type) {
        case "openai":
          return [name, createOpenAI(info)];
        case "deepseek":
          return [name, createDeepSeek(info)];
        case "anthropic":
          return [name, createAnthropic(info)];
        case "google":
          return [name, createGoogleGenerativeAI(info)];
        case "openrouter":
          return [name, createOpenRouter(info)];
        case "xai":
          return [name, createXai(info)];
        default:
          return null;
      }
    })
    .filter((item) => item !== null);

  return createProviderRegistry(Object.fromEntries(providerMap));
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
