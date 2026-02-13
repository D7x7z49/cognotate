// apps/cli/commands/agent/list.ts

import { listAgent, ListAgentSchema } from "@cognotate/core/lib/agent";
import { subCommandAgentLogger as logger } from "@/lib/logger";

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

    const messages: string[] = [];

    const result = await listAgent(input);
    messages.push(`Total agents: ${result.total}`);

    if (result.agents.length === 0) {
      messages.push("No agents found.");
      logger.find(messages.join("\n"));
      return;
    }

    const startIndex = input.skip + 1;
    const endIndex = input.skip + result.agents.length;

    for (const agent of result.agents) {
      messages.push(`- ${agent.nickname} | ${agent.model}`);
    }

    messages.push(`Showing agents ${startIndex} to ${endIndex}`);
    messages.push(`${result.agents.length}/${result.total} agents listed`);

    logger.find(messages.join("\n"));
  } catch (error) {
    console.error(
      `Failed to list agents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
