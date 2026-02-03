// packages/llm/hub.ts

import { createProviderRegistry } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";

type ProviderHub = ReturnType<typeof createProviderRegistry>;

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

let _promise: Promise<ProviderHub> | null = null;
let _current: ProviderHub | undefined;

const getProviderHub = (force = false): Promise<ProviderHub> => {
  if (!force && _current) return Promise.resolve(_current);

  if (!_promise || force) {
    _promise = (async () => {
      const hub = await loadHub();
      _current = hub;
      _promise = null;
      return hub;
    })();
  }
  return _promise;
};

const refreshProviderHub = async (): Promise<ProviderHub> => {
  return getProviderHub(true);
};

export { getProviderHub, refreshProviderHub };
