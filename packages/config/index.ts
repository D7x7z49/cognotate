// packages/config/index.ts

import { homedir } from "os";
import { dirname, join } from "path";

import { HOME_NAME, CONFIG_NAME } from "./src/identity";
import { ConfigSchema, type Config, type ReturnConfig } from "./src/schema";

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

export const ROOT = join(homedir(), HOME_NAME);
export const ROOT_CONFIG = join(ROOT, "config.jsonc");

export const CACHE_DIR = join(ROOT, "cache");
export const SQLITE_DB = join(ROOT, "cognotate.db");

export const DEFAULT_CONFIG: ReturnConfig = {
  database: {
    type: "sqlite",
    url: `file:${SQLITE_DB}`,
  },
};

const findProjectRoot = async (
  startPath: string = process.cwd(),
): Promise<string | null> => {
  let currentDir = startPath;
  while (currentDir !== dirname(currentDir)) {
    const gitDir = join(currentDir, ".git");
    if (await Bun.file(gitDir).exists()) return currentDir;
    currentDir = dirname(currentDir);
  }

  return null;
};

const getProjectConfig = async (): Promise<string | null> => {
  const root = await findProjectRoot();
  if (root) return join(root, CONFIG_NAME);

  return null;
};

const loadConfig = async (): Promise<ReturnConfig> => {
  let rootConfig: Config = {} as Config;
  let projectConfig: Config = {} as Config;

  // ensure root config
  if (await Bun.file(ROOT_CONFIG).exists()) {
    const rootConfigModule = await import(ROOT_CONFIG, {
      with: { type: "jsonc" },
    });
    const rootResult = ConfigSchema.safeParse(rootConfigModule.default);
    if (rootResult.success) rootConfig = rootResult.data;
  }
  // ensure project config
  const projectConfigPath = await getProjectConfig();
  if (projectConfigPath && (await Bun.file(projectConfigPath).exists())) {
    const projectConfigModule = await import(projectConfigPath, {
      with: { type: "jsonc" },
    });
    const projectResult = ConfigSchema.safeParse(projectConfigModule.default);
    if (projectResult.success) projectConfig = projectResult.data;
  }

  // merge
  const mergedConfig: ReturnConfig = {
    ...DEFAULT_CONFIG,
    ...rootConfig,
    ...projectConfig,
  };

  return mergedConfig;
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
