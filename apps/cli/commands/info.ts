// apps/cli/commands/info.ts

import { program } from "commander";
import { getConfig } from "@cognotate/core/lib/config";

const infoAction = async () => {
  const config = await getConfig();

  const message: string[] = [];

  message.push(`root: ${config.info.root}`);
  message.push(`project: ${config.info.project ?? "N/A"}`);
  message.push(`identity: ${config.info.identity ?? "GLOBAL"}`);
  message.push(`DB: ${config.database.type} @ ${config.database.url}`);

  console.log(message.join("\n"));
};

const infoCommand = () => {
  program
    .command("info")
    .description("Display Cognotate configuration information")
    .action(infoAction);
};

export { infoCommand };
