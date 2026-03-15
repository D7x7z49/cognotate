// apps/engine/commands/server/index.ts

import { program } from "commander";
import { runAction, ACTION as RUN_ACTION } from "./run";
import { stopAction, ACTION as STOP_ACTION } from "./stop";
import { statusAction, ACTION as STATUS_ACTION } from "./status";

export const serverCommand = () => {
  const server = program
    .command("server")
    .description("Cognotate Engine Daemon");

  server
    .command("run")
    .description(RUN_ACTION)
    .option("-r, --restart", "Restart Cognotate Engine")
    .action(runAction);

  server.command("stop").description(STOP_ACTION).action(stopAction);

  server.command("status").description(STATUS_ACTION).action(statusAction);
};
