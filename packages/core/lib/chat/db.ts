// packages/core/lib/chat/db.ts

import { ChatType } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/database";
import { DEFAULT_CHAT_MEMBERS_LIMIT, DEFAULT_CHAT_METADATA } from "./constants";
import { type CreateChatInput } from "./schema";

export const createChat = async (input: CreateChatInput) => {
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
