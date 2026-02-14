// packages/core/lib/config/constants.ts

import { homedir } from "os";
import { join } from "path";

import { createKeys } from "@/lib/cache";

// base constants
export const COGNOTATE = "cognotate";
export const HOME_NAME = `.${COGNOTATE}`;
export const CONFIG_NAME = `.${COGNOTATE}.jsonc`;

export const ROOT = join(homedir(), HOME_NAME);
export const ROOT_CONFIG = join(ROOT, "config.jsonc");
export const ROOT_SECRET = join(ROOT, "secret.jsonc");

// logger constants
export const LOGGER_ROOT = join(ROOT, "logs");

// cache key constants
export const CACHE_ROOT = join(ROOT, "cache");
export const CACHE_FILE_KEY = createKeys({
  namespace: CACHE_ROOT,
  sep: ":",
  encode: false,
  filepath: true,
});

// process constants
export const PID_ROOT = join(ROOT, "pids");

// database constants
export const SQLITE_DB = join(ROOT, "cognotate.db");

// engine constants
export const ENGINE_NAME = `${COGNOTATE}-engine`;
export const ENGINE_ROOT = join(ROOT, ENGINE_NAME);
export const ENGINE_PORT = 3913;

// server constants
export const DEFAULT_PORT = 13047;
