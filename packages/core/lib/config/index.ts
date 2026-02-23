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
    local: `file:${SQLITE_DB}`,
  },
  server: {
    port: DEFAULT_PORT,
  },
  log: {
    level: Bun.env.NODE_ENV === "production" ? "warn" : "info",
  },
};

const getProjectInfo = async (): Promise<(string | undefined)[]> => {
  const [identityResult, pathResult] = await Promise.all([
    Bun.$`git rev-list --max-parents=0 HEAD`.nothrow().quiet(),
    Bun.$`git rev-parse --show-toplevel`.nothrow().quiet(),
  ]);

  if (identityResult.exitCode !== 0) {
    console.error(identityResult.stderr.toString());
    return [undefined, undefined];
  }
  if (pathResult.exitCode !== 0) {
    console.error(pathResult.stderr.toString());
    return [undefined, undefined];
  }

  return [
    identityResult.stdout.toString().trim(),
    pathResult.stdout.toString().trim(),
  ];
};

const loadConfig = async (): Promise<ReturnConfig> => {
  let rootConfig: Config = {} as Config;
  let projectConfig: Config = {} as Config;

  const [projectIdentity, projectPath] = await getProjectInfo();
  const projectConfigPath = projectPath ? join(projectPath, CONFIG_NAME) : null;

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
      project: projectIdentity
        ? {
            identity: projectIdentity!,
            name: projectPath!.split("/").slice(-1)[0]!,
            path: projectPath!,
          }
        : undefined,
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
