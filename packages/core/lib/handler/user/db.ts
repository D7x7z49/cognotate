// packages/core/lib/handler/user/db.ts

import { getPrisma } from "@/lib/database";
import type { ListUserInput } from "./schema";

export const listUser = async (input: ListUserInput) => {
  const prisma = await getPrisma();
  return await prisma.user.findMany({
    take: input.take,
    skip: input.skip,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { [input.orderBy]: input.orderDirection },
    where: input.type ? { type: input.type } : undefined,
  });
};
