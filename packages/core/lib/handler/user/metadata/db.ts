// packages/core/lib/handler/user/metadata/db.ts

import { getPrisma } from "@/lib/database";
import type { UpdateAgentMetadataInput } from "./schema";

export const updateAgentMetadata = async (input: UpdateAgentMetadataInput) => {
  const prisma = await getPrisma();
  const result = await prisma.user.update({
    where: { id: input.id },
    data: { metadata: input.metadata },
  });
  return result;
};
