// apps/cli/lib/inquirer/permission.ts

import type {
  NetworkPermission,
  SystemPermission,
} from "@cognotate/core/lib/agent";
import { createListEditor } from "./editor";
import { select, confirm } from "@inquirer/prompts";

// ---------------------------------
// Network Permissions Editor
// ---------------------------------

const editDomainWhitelist = createListEditor({
  listName: "whitelist domains",
  inputPrompt: "Domain to add:",
  emptyMessage: "Whitelist is empty",
  validate: (v) => {
    const regex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(v) || "Invalid domain format";
  },
});

const editDomainBlacklist = createListEditor({
  listName: "blacklist domains",
  inputPrompt: "Domain to add:",
  emptyMessage: "Blacklist is empty",
  validate: (v) => {
    const regex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(v) || "Invalid domain format";
  },
});

async function editNetworkPermissions(
  current?: NetworkPermission,
): Promise<NetworkPermission> {
  let p = current ?? {
    outbound: true,
    domains: { whitelist: [], blacklist: [] },
  };

  while (true) {
    console.log("\nNetwork Permissions");
    console.log(`  Outbound: ${p.outbound ? "yes" : "no"}`);
    console.log(`  Whitelist: ${p.domains.whitelist.length ?? "none"}`);
    console.log(`  Blacklist:  ${p.domains.blacklist.length ?? "none"}`);

    const action = await select({
      message: "Action:",
      choices: [
        { name: "Toggle outbound", value: "toggle" },
        { name: "Edit whitelist", value: "whitelist" },
        { name: "Edit blacklist", value: "blacklist" },
        { name: "Done", value: "done" },
      ],
    });

    if (action === "done") return p;

    if (action === "toggle") {
      p.outbound = await confirm({
        message: "Allow outbound?",
        default: p.outbound,
      });
    } else if (action === "whitelist") {
      p.domains.whitelist = await editDomainWhitelist(p.domains.whitelist);
    } else if (action === "blacklist") {
      p.domains.blacklist = await editDomainBlacklist(p.domains.blacklist);
    }
  }
}

// ---------------------------------
// System Permissions Editor
// ---------------------------------

const editCommandWhitelist = createListEditor({
  listName: "whitelist commands",
  inputPrompt: "Command to add:",
  emptyMessage: "Command whitelist is empty",
});

const editCommandBlacklist = createListEditor({
  listName: "blacklist commands",
  inputPrompt: "Command to add:",
  emptyMessage: "Command blacklist is empty",
});

async function editSystemPermissions(
  current?: SystemPermission,
): Promise<SystemPermission> {
  let p = current ?? {
    read: true,
    write: false,
    execute: false,
    commands: { whitelist: [], blacklist: [] },
  };

  while (true) {
    console.log("\nSystem Permissions");
    console.log(`  Read:    ${p.read ? "yes" : "no"}`);
    console.log(`  Write:   ${p.write ? "yes" : "no"}`);
    console.log(`  Execute: ${p.execute ? "yes" : "no"}`);
    console.log(
      `  Whitelist commands: ${p.commands.whitelist.length ?? "none"}`,
    );
    console.log(
      `  Blacklist  commands: ${p.commands.blacklist.length ?? "none"}`,
    );

    const action = await select({
      message: "Action:",
      choices: [
        { name: "Toggle read", value: "read" },
        { name: "Toggle write", value: "write" },
        { name: "Toggle execute", value: "execute" },
        { name: "Edit cmd whitelist", value: "cmd_whitelist" },
        { name: "Edit cmd blacklist", value: "cmd_blacklist" },
        { name: "Done", value: "done" },
      ],
    });

    if (action === "done") return p;

    if (action === "read") {
      p.read = await confirm({ message: "Allow read?", default: p.read });
    } else if (action === "write") {
      p.write = await confirm({ message: "Allow write?", default: p.write });
    } else if (action === "execute") {
      p.execute = await confirm({ message: "Allow exec?", default: p.execute });
    } else if (action === "cmd_whitelist") {
      p.commands.whitelist = await editCommandWhitelist(p.commands.whitelist);
    } else if (action === "cmd_blacklist") {
      p.commands.blacklist = await editCommandBlacklist(p.commands.blacklist);
    }
  }
}

export { editNetworkPermissions, editSystemPermissions };
