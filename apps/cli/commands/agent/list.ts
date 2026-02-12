// apps/cli/commands/agent/list.ts

import { listAgent, ListAgentSchema } from "@cognotate/core/lib/agent";

export const listAgentAction = async (options?: {
  take?: number;
  skip?: number;
  orderBy?: "asc" | "desc";
  enabled?: boolean;
  disabled?: boolean;
}) => {
  try {
    // Check for conflicting flags
    if (options?.enabled && options?.disabled) {
      console.error(
        "Error: --enabled and --disabled flags cannot be used together",
      );
      process.exit(1);
    }

    // Determine enabled filter
    let enabledFilter: "all" | "enabled" | "disabled" = "all";

    if (options?.enabled) {
      enabledFilter = "enabled";
    }

    if (options?.disabled) {
      enabledFilter = "disabled";
    }

    const input = ListAgentSchema.parse({
      take: options?.take ?? 16,
      skip: options?.skip ?? 0,
      orderBy: options?.orderBy ?? "asc",
      enabled: enabledFilter,
    });

    const result = await listAgent(input);

    console.log(`Total agents: ${result.total}`);

    if (result.agents.length === 0) {
      console.log("No agents found.");
      return;
    }

    const startIndex = input.skip + 1;
    const endIndex = input.skip + result.agents.length;

    for (const agent of result.agents) {
      console.log(`- ${agent.nickname} | ${agent.model}`);
    }

    console.log(
      `Listed agents: ${startIndex}~${endIndex}, ${result.agents.length}/${result.total}`,
    );
  } catch (error) {
    console.error(
      `Failed to list agents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
