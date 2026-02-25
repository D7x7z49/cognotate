// apps/cli/commands/chat/list.ts

import { listChat, ListChatSchema } from "@cognotate/core/lib/chat";
import { subCommandChatLogger as logger } from "@/lib/logger";

export const listChatAction = async (options?: {
  take?: number;
  skip?: number;
  orderBy?: "asc" | "desc";
}) => {
  try {
    const input = ListChatSchema.parse({
      take: options?.take ?? 16,
      skip: options?.skip ?? 0,
      orderBy: options?.orderBy ?? "asc",
    });

    const messages: string[] = [];

    const result = await listChat(input);
    messages.push(`Total chats: ${result.total}`);

    if (result.chats.length === 0) {
      messages.push("No chats found.");
      logger.find(messages.join("\n"));
      return;
    }

    const startIndex = input.skip + 1;
    const endIndex = input.skip + result.chats.length;

    for (const chat of result.chats) {
      const memberCount = (chat as any)._count?.members ?? 0;
      messages.push(
        `- ${chat.nickname} | ${chat.type} | ${memberCount}/${chat.membersLimit} members`,
      );
    }

    messages.push(`Showing chats ${startIndex} to ${endIndex}`);
    messages.push(`${result.chats.length}/${result.total} chats listed`);

    logger.find(messages.join("\n"));
  } catch (error) {
    logger.fail(
      `Failed to list chats: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
