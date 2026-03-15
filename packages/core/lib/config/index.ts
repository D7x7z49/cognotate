// packages/core/lib/config/index.ts

export * from "./constants";

import { ROOT_CONFIG, SQLITE_DB } from "./constants";
import { ConfigSchema, type Config, type ReturnConfig } from "./schema";

declare global {
  var __cognotate_config:
    | {
        current: ReturnConfig | undefined;
        promise: Promise<ReturnConfig> | null;
      }
    | undefined;
}

const getConfigState = () => {
  if (!globalThis.__cognotate_config) {
    globalThis.__cognotate_config = {
      current: undefined,
      promise: null,
    };
  }
  return globalThis.__cognotate_config;
};

export const DEFAULT_CONFIG: Config = {
  database: {
    local: `file:${SQLITE_DB}`,
  },
  log: {
    level: Bun.env.NODE_ENV === "production" ? "warn" : "info",
  },
};

const loadConfig = async (): Promise<ReturnConfig> => {
  let rootConfig: Config = {} as Config;

  // ensure root config
  if (await Bun.file(ROOT_CONFIG).exists()) {
    const rootConfigModule = await import(ROOT_CONFIG, {
      with: { type: "jsonc" },
    });
    const rootResult = ConfigSchema.safeParse(rootConfigModule.default);
    if (rootResult.success) rootConfig = rootResult.data;
  }

  // merge
  const mergedConfig: Config = {
    ...DEFAULT_CONFIG,
    ...rootConfig,
  };

  return mergedConfig as ReturnConfig;
};

const getConfig = (force = false): Promise<ReturnConfig> => {
  const state = getConfigState();

  if (!force && state.current) {
    return Promise.resolve(state.current);
  }

  if (!state.promise || force) {
    state.promise = (async () => {
      const cfg = await loadConfig();
      state.current = cfg;
      state.promise = null;
      return cfg;
    })();
  }
  return state.promise;
};

const refreshConfig = async (): Promise<ReturnConfig> => {
  return getConfig(true);
};

export { getConfig, refreshConfig };
