// packages/core/lib/agent/constants.ts

import type { AgentPermission } from "./schema";

export const DEFAULT_AGENT_PERMISSION: AgentPermission = {
  network: {
    outbound: false,
    domains: {
      whitelist: [],
      blacklist: [],
    },
  },
  system: {
    read: false,
    write: false,
    execute: false,
    commands: {
      whitelist: [],
      blacklist: [],
    },
  },
};
