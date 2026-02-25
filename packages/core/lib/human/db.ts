// packages/core/lib/human/db.ts

import { UserType } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/database";
import {
  type AddHumanInput,
  type InfoHumanByIdInput,
  type InfoHumanByHostNicknameInput,
  type ListHumanInput,
} from "./schema";

export const infoHumanById = async (input: InfoHumanByIdInput) => {
  const prisma = await getPrisma();
  const human = await prisma.human.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      host: true,
      nickname: true,
      identity: true,
    },
  });

  return human;
};

export const infoHumanByHostNickname = async (
  input: InfoHumanByHostNicknameInput,
) => {
  const prisma = await getPrisma();
  const human = await prisma.human.findUnique({
    where: {
      host_nickname: {
        host: input.host,
        nickname: input.nickname,
      },
      identity: { isNot: null },
    },
    select: {
      id: true,
      host: true,
      nickname: true,
      identity: true,
    },
  });

  return human;
};

export const addHuman = async (input: AddHumanInput) => {
  const prisma = await getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.human.findUnique({
      where: {
        host_nickname: {
          host: input.host,
          nickname: input.nickname,
        },
      },
    });
    if (existing)
      return {
        success: false,
        data: "Human already exists",
      };

    const identity = await tx.identity.create({
      data: {
        type: UserType.HUMAN,
      },
    });

    const human = await tx.human.create({
      data: {
        host: input.host,
        nickname: input.nickname,
        identityId: identity.id,
      },
      include: {
        identity: true,
      },
    });

    await tx.identity.update({
      where: { id: identity.id },
      data: { humanId: human.id },
    });

    return { success: true, data: human };
  });

  return result;
};

export const listHuman = async (input: ListHumanInput) => {
  const prisma = await getPrisma();

  const [humans, total] = await Promise.all([
    prisma.human.findMany({
      where: {
        identity: { isNot: null },
      },
      select: {
        id: true,
        host: true,
        nickname: true,
        identity: true,
      },
      orderBy: {
        identity: {
          createdAt: input.orderBy,
        },
      },
      take: input.take,
      skip: input.skip,
    }),
    prisma.human.count({
      where: {
        identity: { isNot: null },
      },
    }),
  ]);

  return { humans, total };
};
