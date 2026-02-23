// apps/cli/commands/engine/index.ts

import { program } from "commander";
import { runEngineAction } from "./run";
import { stopEngineAction } from "./stop";
import { statusEngineAction } from "./status";
import { logEngineAction } from "./log";

const engineCommand = () => {
  const engine = program
    .command("engine")
    .description("Manage the Cognotate engine service");

  engine
    .command("run")
    .description("Start the engine service")
    .option("--restart", "Restart the engine if it's already running")
    .action(runEngineAction);

  engine
    .command("stop")
    .description("Stop the engine service")
    .action(stopEngineAction);

  engine
    .command("status")
    .description("Show engine service status")
    .action(statusEngineAction);

  engine
    .command("log")
    .description("Show engine service logs")
    .option(
      "-n, --lines <number>",
      "Number of lines to show (default: 20)",
      parseInt,
    )
    .action(logEngineAction);
};

export { engineCommand };
