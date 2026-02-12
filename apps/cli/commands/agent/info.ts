// apps/cli/commands/agent/info.ts

import { infoAgent, infoAgentSchema } from "@cognotate/core/lib/agent";

export const infoAgentAction = async (
  nickname: string,
  options?: { format?: string },
) => {
  try {
    const input = infoAgentSchema.parse({ nickname });

    const agent = await infoAgent(input);

    if (!agent) {
      console.error(`Agent '${nickname}' not found.`);
      process.exit(1);
    }

    if (options?.format === "json") {
      console.log(JSON.stringify(agent, null, 2));
      return;
    }

    // Default formatted output - collect all lines for single print
    const output: string[] = [];
    output.push(`Agent: ${agent.nickname}`);
    output.push(`Model: ${agent.model}`);
    output.push(`Enabled: ${agent.enabled}`);

    // Handle different profession formats
    if (Array.isArray(agent.profession)) {
      // Legacy format: array of strings
      output.push(`Profession: ${agent.profession.join(", ")}`);
    } else if (agent.profession && typeof agent.profession === "object") {
      // New format: structured permissions
      output.push(`Profession:`);
      if (agent.profession.network) {
        output.push(`  Network:`);
        output.push(`    Outbound: ${agent.profession.network.outbound}`);
        output.push(
          `    Domains: whitelist=${JSON.stringify(agent.profession.network.domains?.whitelist || [])}, blacklist=${JSON.stringify(agent.profession.network.domains?.blacklist || [])}`,
        );
      } else {
        output.push(`  Network: None`);
      }
      if (agent.profession.system) {
        output.push(`  System:`);
        output.push(`    Read: ${agent.profession.system.read}`);
        output.push(`    Write: ${agent.profession.system.write}`);
        output.push(`    Execute: ${agent.profession.system.execute}`);
        output.push(
          `    Commands: whitelist=${JSON.stringify(agent.profession.system.commands?.whitelist || [])}, blacklist=${JSON.stringify(agent.profession.system.commands?.blacklist || [])}`,
        );
      } else {
        output.push(`  System: None`);
      }
    } else {
      output.push(`Profession: ${agent.profession || "None"}`);
    }

    output.push(`Created: ${agent.identity.createdAt.toISOString()}`);

    console.log(output.join("\n"));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      console.error(`Invalid arguments: ${error.message}`);
    } else {
      console.error(
        `Failed to get agent info: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    process.exit(1);
  }
};
