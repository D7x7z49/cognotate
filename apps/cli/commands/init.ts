// apps/cli/commands/init.ts

import { program } from "commander";
import { getConfig } from "@cognotate/core/lib/config";
import { ChatType, addChat } from "@cognotate/core/lib/chat";
import { cliLogger as logger } from "@/lib/logger";

const initAction = async () => {
  const config = await getConfig();
  const nickname = config.info.project?.name ?? "global";

  logger.step(`Creating Chat "${nickname}"`);

  const result = await addChat({
    nickname,
    type: ChatType.GROUP,
  });

  if (!result.success) {
    logger.warn(result.data);
    return;
  }

  logger.find(
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
