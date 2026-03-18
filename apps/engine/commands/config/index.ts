// apps/engine/commands/config/index.ts

import { program } from "commander";
import { getAction, ACTION as GET_ACTION } from "./get";
import { setAction, ACTION as SET_ACTION } from "./set";

export const configCommand = () => {
  const config = program
    .command("config")
    .description("Manage Cognotate Configuration");

  config
    .command("get")
    .description(GET_ACTION)
    .option("-p, --path <path>", "JSON path to get value from")
    .option("-s, --schema", "Print config schema")
    .action(getAction);

  config
    .command("set")
    .description(SET_ACTION)
    .option("-p, --path <path>", "JSON path to set value at")
    .option("-v, --value <value>", "Value to set")
    .action(setAction);
};
