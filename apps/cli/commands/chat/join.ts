// apps/cli/commands/chat/join.ts

import { joinChat, JoinChatSchema } from "@cognotate/core/lib/chat";
import { subCommandChatLogger as logger } from "@/lib/logger";

export const joinChatAction = async (
  chatNickname: string,
  options?: {
    as?: string;
    human?: string;
    agent?: string;
  },
) => {
  try {
    if (options?.human && options?.agent) {
      logger.fail(
        "Error: --human and --agent cannot be used together. Choose one.",
      );
      process.exit(1);
    }

    if (!options?.human && !options?.agent) {
      logger.fail(
        "Error: Must specify either --human <nickname@host> or --agent <nickname>",
      );
      process.exit(1);
    }

    if (!options?.as) {
      logger.fail("Missing required option: --as <nickname>");
      process.exit(1);
    }

    const input = JoinChatSchema.parse({
      chatNickname,
      memberNickname: options.as,
      human: options?.human,
      agent: options?.agent,
    });

    const result = await joinChat(input);

    if (!result.success) {
      logger.fail(result.data);
      process.exit(1);
    }

    const chatMember = result.data;
    const memberType = chatMember.identity.agentId ? "Agent" : "Human";
    const memberName = options?.agent ?? options?.human ?? chatMember.nickname;

    logger.step(`Joined chat "${chatMember.chat.nickname}"`);
    logger.find(`${memberType}: ${memberName}`);
    logger.find(`Member ID: ${chatMember.id}`);
    logger.find(`Member nickname: ${chatMember.nickname}`);
    logger.find(`Chat type: ${chatMember.chat.type}`);
  } catch (error) {
    logger.fail(
      `Failed to join chat: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
