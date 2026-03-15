// apps/engine/main.ts

import { program } from "commander";
import { COGNOTATE } from "@cognotate/core/lib/config";
import { serverCommand } from "./commands";
import packageInfo from "./package.json" assert { type: "json" };

const bootProgram = async () => {
  // initialize program
  program
    .name(COGNOTATE)
    .version(packageInfo.version)
    .description(packageInfo.description);

  // register commands
  serverCommand();
};

const runCLI = async () => {
  await bootProgram();
  await program.parseAsync(process.argv);
};

export { runCLI };
