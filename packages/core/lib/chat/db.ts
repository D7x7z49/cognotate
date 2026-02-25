// packages/core/lib/chat/db.ts

import { ChatType } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/database";
import { DEFAULT_CHAT_MEMBERS_LIMIT, DEFAULT_CHAT_METADATA } from "./constants";
import {
  type AddChatInput,
  type ListChatInput,
  type JoinChatInput,
} from "./schema";

export const addChat = async (input: AddChatInput) => {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.chat.findUnique({
      where: { nickname: input.nickname },
    });
    if (existing) {
      return {
        success: false,
        data: `Chat "${input.nickname}" already exists`,
      };
    }

    const chat = await tx.chat.create({
      data: {
        type: input.type as ChatType,
        nickname: input.nickname,
        description: input.description ?? "",
        membersLimit: input.membersLimit ?? DEFAULT_CHAT_MEMBERS_LIMIT,
        metadata: input.metadata ?? DEFAULT_CHAT_METADATA,
      },
    });

    return { success: true, data: chat };
  });
};

export const listChat = async (input: ListChatInput) => {
  const prisma = await getPrisma();

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      take: input.take,
      skip: input.skip,
      orderBy: {
        createdAt: input.orderBy,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
    prisma.chat.count(),
  ]);

  return { chats, total };
};

export const joinChat = async (input: JoinChatInput) => {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const chat = await tx.chat.findUnique({
      where: { nickname: input.chatNickname },
    });

    if (!chat) {
      return {
        success: false,
        data: `Chat "${input.chatNickname}" does not exist`,
      };
    }

    let identityId: string | null = null;
    let agentNickname: string | null = null;
    let humanIdentifier: string | null = null;

    if (input.agent) {
      const agent = await tx.agent.findUnique({
        where: { nickname: input.agent },
        include: { identity: true },
      });

      if (!agent) {
        return {
          success: false,
          data: `Agent "${input.agent}" does not exist`,
        };
      }

      if (!agent.enabled) {
        return {
          success: false,
          data: `Agent "${input.agent}" is disabled. Enable it first.`,
        };
      }

      identityId = agent.identityId;
      agentNickname = agent.nickname;
    } else if (input.human) {
      const parts = input.human.split("@");
      if (parts.length !== 2) {
        return {
          success: false,
          data: `Invalid human identifier "${input.human}". Use format: nickname@host`,
        };
      }

      const [nickname, host] = [parts[0]!, parts[1]!];
      const human = await tx.human.findUnique({
        where: {
          host_nickname: {
            host,
            nickname,
          },
        },
        include: { identity: true },
      });

      if (!human) {
        return {
          success: false,
          data: `Human "${input.human}" does not exist`,
        };
      }

      identityId = human.identityId;
      humanIdentifier = `${human.nickname}@${human.host}`;
    } else {
      return {
        success: false,
        data: "Must specify either --human or --agent to join the chat",
      };
    }

    if (!identityId) {
      return {
        success: false,
        data: "Failed to resolve identity",
      };
    }

    const existingMember = await tx.chatMember.findUnique({
      where: {
        chatId_identityId: {
          chatId: chat.id,
          identityId,
        },
      },
    });

    if (existingMember) {
      const alreadyJoinedAs = agentNickname
        ? `Agent "${agentNickname}"`
        : `Human "${humanIdentifier}"`;
      return {
        success: false,
        data: `${alreadyJoinedAs} is already a member of chat "${input.chatNickname}"`,
      };
    }

    const chatMember = await tx.chatMember.create({
      data: {
        chatId: chat.id,
        identityId,
        nickname: input.memberNickname,
      },
      include: {
        chat: true,
        identity: true,
      },
    });

    return { success: true, data: chatMember };
  });
};
