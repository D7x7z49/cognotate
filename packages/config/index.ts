// packages/config/index.ts

import { homedir } from "os";
import { dirname, join } from "path";

import { HOME_NAME, CONFIG_NAME } from "./src/identity";
import { ConfigSchema, type Config, type ReturnConfig } from "./src/schema";

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

async function findProjectRoot(
  startPath: string = process.cwd(),
): Promise<string | null> {
  let currentDir = startPath;
  while (currentDir !== dirname(currentDir)) {
    const gitDir = join(currentDir, ".git");
    if (await Bun.file(gitDir).exists()) return currentDir;
    currentDir = dirname(currentDir);
  }

  return null;
}

async function getProjectConfig(): Promise<string | null> {
  const root = await findProjectRoot();
  if (root) return join(root, CONFIG_NAME);

  return null;
}

async function loadConfig() {
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
}

let _promise: Promise<ReturnConfig> | null = null;
let _current: ReturnConfig | undefined;

function getConfig(force = false): Promise<ReturnConfig> {
  if (!force && _current) return Promise.resolve(_current);

  if (!_promise || force) {
    _promise = (async () => {
      const cfg = await loadConfig();
      _current = cfg;
      _promise = null;
      return cfg;
    })();
  }
  return _promise;
}

async function refreshConfig() {
  return getConfig(true);
}

export { getConfig, refreshConfig };
