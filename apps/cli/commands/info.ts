// apps/cli/commands/info.ts

import { program } from "commander";
import { getConfig } from "@cognotate/core/lib/config";

// Safely format database URL for display (hide credentials)
const formatPostgresqlUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "postgresql:") {
      const db = parsedUrl.pathname.slice(1);
      return `${parsedUrl.host}/${db}${parsedUrl.search}`;
    }
    return url;
  } catch {
    return url;
  }
};

const infoAction = async () => {
  const config = await getConfig();

  const message: string[] = [];

  // basic info
  message.push(`root: ${config.info.root}`);

  // project info
  message.push(`PROJECT`);
  if (config.info.project) {
    message.push(`- identity: ${config.info.project.identity}`);
    message.push(`- name: ${config.info.project.name}`);
    message.push(`- path: ${config.info.project.path}`);
  } else {
    message.push("- GLOBAL MODE (no project detected)");
  }

  // determine database type and URL
  message.push(`DATABASE`);
  message.push(`- local: ${config.database.local}`);
  if (config.database.remote && config.database.remote.length > 0) {
    message.push(`- remote:`);
    config.database.remote.forEach((remoteUrl, index) => {
      message.push(`  ${index + 1}. ${formatPostgresqlUrl(remoteUrl)}`);
    });
  } else {
    message.push(`- remote: N/A`);
  }

  console.log(message.join("\n"));
};

const infoCommand = () => {
  program
    .command("info")
    .description("Display Cognotate configuration information")
    .action(infoAction);
};

export { infoCommand };
