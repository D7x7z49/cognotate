// packages/core/lib/agent/db.ts

import { UserType } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/database";
import {
  type AddAgentInput,
  type InfoAgentInput,
  type ListAgentInput,
  type UpdateAgentInput,
} from "./schema";

export const infoAgent = async (input: InfoAgentInput) => {
  const prisma = await getPrisma();
  const agent = await prisma.agent.findUnique({
    where: {
      nickname: input.nickname,
      identity: { isNot: null },
    },
    select: {
      id: true,
      nickname: true,
      model: true,
      profession: true,
      enabled: true,
      identity: true,
    },
  });

  return agent;
};

export const listAgent = async (input: ListAgentInput) => {
  const prisma = await getPrisma();

  const whereCondition = {
    identity: { isNot: null },
    ...(input.enabled === "enabled" && { enabled: true }),
    ...(input.enabled === "disabled" && { enabled: false }),
  };

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where: whereCondition,
      select: {
        nickname: true,
        model: true,
      },
      orderBy: {
        identity: {
          createdAt: input.orderBy,
        },
      },
      take: input.take,
      skip: input.skip,
    }),
    prisma.agent.count({
      where: whereCondition,
    }),
  ]);

  return { agents, total };
};

export const addAgent = async (input: AddAgentInput) => {
  const prisma = await getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.agent.findUnique({
      where: {
        nickname: input.nickname,
        identity: { isNot: null },
      },
    });
    if (existing)
      return {
        success: false,
        data: "Nickname already exists",
      };

    // Create Identity first
    const identity = await tx.identity.create({
      data: {
        type: UserType.AGENT,
      },
    });

    // Create Agent linked to Identity
    const agent = await tx.agent.create({
      data: {
        nickname: input.nickname,
        model: input.model,
        profession: input.profession,
        identityId: identity.id,
      },
      include: {
        identity: true,
      },
    });

    // Update Identity with agentId to establish bidirectional relationship
    await tx.identity.update({
      where: { id: identity.id },
      data: { agentId: agent.id },
    });

    return { success: true, data: agent };
  });

  return result;
};

export const updateAgent = async (input: UpdateAgentInput) => {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.agent.findUnique({
      where: {
        nickname: input.targetNickname,
        identity: { isNot: null },
      },
    });
    if (!existing)
      return {
        success: false,
        data: "Agent not found",
      };

    if (input.nickname && input.nickname !== input.targetNickname) {
      const duplicate = await tx.agent.findUnique({
        where: { nickname: input.nickname, identity: { isNot: null } },
      });
      if (duplicate)
        return {
          success: false,
          data: "Nickname already exists",
        };
    }

    const updated = await tx.agent.update({
      where: { nickname: input.targetNickname },
      data: {
        ...(input.nickname ? { nickname: input.nickname } : {}),
        ...(input.model ? { model: input.model } : {}),
        ...(input.profession ? { profession: input.profession } : {}),
      },
      include: { identity: true },
    });
    return { success: true, data: updated };
  });
};

export const toggleAgentEnabled = async (
  nickname: string,
  enabled: boolean,
) => {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.agent.findUnique({
      where: {
        nickname,
        identity: { isNot: null },
      },
    });

    if (!existing) {
      return {
        success: false,
        data: "Agent not found",
      };
    }

    const updated = await tx.agent.update({
      where: { nickname },
      data: { enabled },
      select: {
        nickname: true,
        enabled: true,
      },
    });

    return { success: true, data: updated };
  });
};
