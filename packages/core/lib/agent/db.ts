// packages/core/lib/agent/db.ts

import { getPrisma } from "@/lib/database";
import { type AddAgentInput } from "./schema";

export async function addAgent(input: AddAgentInput) {
  const prisma = await getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    // Create Identity first
    const identity = await tx.identity.create({
      data: {
        type: "AGENT",
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

    return agent;
  });

  return result;
}
