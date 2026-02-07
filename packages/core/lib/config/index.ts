// packages/core/lib/config/index.ts

export * from "./constants";

import { join } from "path";

import {
  CONFIG_NAME,
  DEFAULT_PORT,
  ROOT,
  ROOT_CONFIG,
  SQLITE_DB,
} from "./constants";
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
    type: "sqlite",
    url: `file:${SQLITE_DB}`,
  },
  server: {
    port: DEFAULT_PORT,
  },
};

const getProjectInfo = async (): Promise<(string | undefined)[]> => {
  const [rootResult, identityResult] = await Promise.all([
    Bun.$`git rev-list --max-parents=0 HEAD`.nothrow().quiet(),
    Bun.$`git rev-parse --show-toplevel`.nothrow().quiet(),
  ]);

  if (rootResult.exitCode !== 0) {
    console.error(rootResult.stderr.toString());
    return [undefined, undefined];
  }
  if (identityResult.exitCode !== 0) {
    console.error(identityResult.stderr.toString());
    return [undefined, undefined];
  }

  return [
    rootResult.stdout.toString().trim(),
    identityResult.stdout.toString().trim(),
  ];
};

const loadConfig = async (): Promise<ReturnConfig> => {
  let rootConfig: Config = {} as Config;
  let projectConfig: Config = {} as Config;

  const [projectRoot, projectIdentity] = await getProjectInfo();
  const projectConfigPath = projectRoot ? join(projectRoot, CONFIG_NAME) : null;

  // ensure root config
  if (await Bun.file(ROOT_CONFIG).exists()) {
    const rootConfigModule = await import(ROOT_CONFIG, {
      with: { type: "jsonc" },
    });
    const rootResult = ConfigSchema.safeParse(rootConfigModule.default);
    if (rootResult.success) rootConfig = rootResult.data;
  }
  // ensure project config
  if (projectConfigPath && (await Bun.file(projectConfigPath).exists())) {
    const projectConfigModule = await import(projectConfigPath, {
      with: { type: "jsonc" },
    });
    const projectResult = ConfigSchema.safeParse(projectConfigModule.default);
    if (projectResult.success) projectConfig = projectResult.data;
  }

  // merge
  const mergedConfig: Config = {
    ...DEFAULT_CONFIG,
    ...rootConfig,
    ...projectConfig,
    info: {
      root: ROOT,
      project: projectRoot,
      identity: projectIdentity,
    },
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
