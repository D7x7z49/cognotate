// apps/cli/commands/agent/index.ts

import { program } from "commander";
import { addAgentAction } from "./add";

const agentCommand = () => {
  const agent = program
    .command("agent")
    .description("Manage AI agents for planning and execution");

  // Add subcommands
  agent
    .command("add")
    .description("Add a new planning agent")
    .option("--ask", "Use interactive prompts to configure the agent")
    .option(
      "--json <source>",
      "Load agent configuration from JSON file or string",
    )
    .action(addAgentAction);
};

export { agentCommand };
