// apps/cli/main.ts

import { program } from "commander";
import { COGNOTATE } from "@cognotate/core/lib/config";
import {
  infoCommand,
  initCommand,
  authCommand,
  chatCommand,
  agentCommand,
  engineCommand,
} from "./commands";
import packageInfo from "./package.json" assert { type: "json" };

const bootProgram = async () => {
  // initialize program
  program
    .name(COGNOTATE)
    .version(packageInfo.version)
    .description(packageInfo.description);

  // register commands
  infoCommand();
  initCommand();
  authCommand();
  chatCommand();
  agentCommand();
  engineCommand();
};

const runCLI = async () => {
  await bootProgram();
  await program.parseAsync(process.argv);
};

export { runCLI };
