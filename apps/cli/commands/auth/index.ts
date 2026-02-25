// apps/cli/commands/auth/index.ts

import { program } from "commander";
import { loginAction } from "./login";
import { listAction } from "./list";
import { switchAction } from "./switch";

export const authCommand = () => {
  const auth = program
    .command("auth")
    .description("Manage authentication and human identities");

  auth
    .command("login")
    .description("Login with current OS user")
    .action(loginAction);

  auth
    .command("list")
    .description("List all available human identities")
    .action(listAction);

  auth
    .command("switch <nickname@host>")
    .description("Switch to a different human identity")
    .action(switchAction);
};
