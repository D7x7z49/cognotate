// apps/cli/commands/chat/index.ts

import { program } from "commander";
import { listChatAction } from "./list";
import { joinChatAction } from "./join";

export const chatCommand = () => {
  const chat = program
    .command("chat")
    .description("Manage chats and chat memberships");

  chat
    .command("list")
    .description("List all chats")
    .option("--take <number>", "Number of chats to return", "16")
    .option("--skip <number>", "Number of chats to skip", "0")
    .option("--orderBy <order>", "Sort order (asc/desc)", "asc")
    .action(async (options) => {
      await listChatAction({
        take: parseInt(options.take, 10),
        skip: parseInt(options.skip, 10),
        orderBy: options.orderBy as "asc" | "desc",
      });
    });

  chat
    .command("join <chat-nickname>")
    .description("Join a chat")
    .option("--as <nickname>", "Nickname to use in the chat")
    .option("--human <nickname@host>", "Human to join (format: nickname@host)")
    .option("--agent <nickname>", "Agent to join")
    .action(async (chatNickname, options) => {
      await joinChatAction(chatNickname, {
        as: options.as,
        human: options.human,
        agent: options.agent,
      });
    });
};
