// apps/cli/commands/agent/index.ts

import { program } from "commander";
import { addAgentAction } from "./add";
import { infoAgentAction } from "./info";
import { listAgentAction } from "./list";
import { updateAgentAction } from "./update";

const agentCommand = () => {
  const agent = program
    .command("agent")
    .description("Manage AI agents for planning and execution");

  agent
    .command("info <nickname>")
    .description("Show detailed information about a planning agent")
    .option("--format <format>", "Output format (json)", "text")
    .action(infoAgentAction);

  agent
    .command("list")
    .description("List all planning agents")
    .option("--take <number>", "Number of agents to return (1-64)", parseInt)
    .option("--skip <number>", "Number of agents to skip (>=0)", parseInt)
    .option("--order-by <order>", "Sort order (asc or desc)", "asc")
    .action(listAgentAction);

  agent
    .command("add")
    .description("Add a new planning agent")
    .option("--ask", "Use interactive prompts to configure the agent")
    .option(
      "--json <source>",
      "Load agent configuration from JSON file or string",
    )
    .action(addAgentAction);

  agent
    .command("update <target>")
    .description("Update an existing planning agent")
    .option("--ask", "Use interactive prompts to update the agent")
    .option(
      "--json <source>",
      "Load update configuration from JSON file or string",
    )
    .action(updateAgentAction);
};

export { agentCommand };
