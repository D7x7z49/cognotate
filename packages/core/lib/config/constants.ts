// packages/core/lib/config/constants.ts

import { homedir } from "os";
import { join } from "path";

import { createKeys } from "@/lib/cache";

// warning info
if (!Bun.env.ENGINE_JWT_SECRET) {
  throw new Error("ENGINE_JWT_SECRET is not set.");
}

// base constants
export const COGNOTATE = "cognotate";
export const HOME_NAME = `.${COGNOTATE}`;

export const ROOT = join(Bun.env.COGNOTATE_HOME ?? homedir(), HOME_NAME);
export const ROOT_CONFIG = join(ROOT, "config.jsonc");

// cache key constants
export const CACHE_ROOT = join(ROOT, "cache");
export const CACHE_FILE_KEY = createKeys({
  namespace: CACHE_ROOT,
  sep: ":",
  encode: false,
  filepath: true,
});

// database constants
export const SQLITE_DB = join(ROOT, "cognotate.db");

// logger constants
export const LOGGER_ROOT = join(ROOT, "logs");

// engine constants
export const ENGINE_NAME = `${COGNOTATE}-engine`;
export const ENGINE_ROOT = join(ROOT, ENGINE_NAME);
export const ENGINE_PORT = 3913;
export const ENGINE_JWT_SECRET = Bun.env.ENGINE_JWT_SECRET;

// process constants
export const PID_ROOT = join(ROOT, "pids");

// agent home
export const AGENT_ROOT = join(ROOT, "agent");
export const getAgentHome = (agentId: string) => join(AGENT_ROOT, agentId);
export const getAgentDocsRoot = (agentId: string) =>
  join(getAgentHome(agentId), "docs");
export const getAgentRepoRoot = (agentId: string) =>
  join(getAgentHome(agentId), "repo");
