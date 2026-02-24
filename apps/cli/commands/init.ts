// apps/cli/commands/init.ts

import { program } from "commander";
import { getConfig } from "@cognotate/core/lib/config";
import { ChatType, createChat } from "@cognotate/core/lib/chat";
import { cliLogger } from "@/lib/logger";

const initAction = async () => {
  const config = await getConfig();
  const nickname = config.info.project?.name ?? "global";

  cliLogger.step(`Creating Chat "${nickname}"`);

  const result = await createChat({
    nickname,
    type: ChatType.GROUP,
  });

  if (!result.success) {
    cliLogger.warn(result.data);
    return;
  }

  cliLogger.find(
    `Created Chat "${result.data.id}" with nickname "${result.data.nickname}"`,
  );
};

const initCommand = () => {
  program
    .command("init")
    .description("Initialize Cognotate with a default Chat")
    .action(initAction);
};

export { initCommand };
