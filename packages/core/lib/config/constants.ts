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

export const SQLITE_DB = join(ROOT, "cognotate.db");

// server constants
export const DEFAULT_PORT = 13047;

// cache key constants
export const CACHE_DIR = join(ROOT, "cache");

export const CACHE_FILE_KEY = createKeys({
  namespace: CACHE_DIR,
  sep: ":",
  encode: false,
  filepath: true,
});
