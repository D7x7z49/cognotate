// packages/core/lib/handler/user/db.ts

import { getPrisma } from "@/lib/database";
import type { User } from "@/prisma/client";
import type { AddUserInput, GetUserByIdInput, ListUserInput } from "./schema";

export const getUserById = async (
  input: GetUserByIdInput,
): Promise<User | null> => {
  const prisma = await getPrisma();
  const result = await prisma.user.findUnique({ where: { id: input.id } });
  return result;
};

export const listUser = async (input: ListUserInput): Promise<User[]> => {
  const prisma = await getPrisma();
  const result = await prisma.user.findMany({
    take: input.take,
    skip: input.skip,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { [input.orderBy]: input.orderDirection },
    where: input.type ? { type: input.type } : undefined,
  });
  return result;
};

export const addUser = async (input: AddUserInput): Promise<User> => {
  const prisma = await getPrisma();
  const result = await prisma.user.upsert({
    where: { nickname: input.nickname },
    update: {},
    create: {
      type: input.type,
      nickname: input.nickname,
      metadata: {},
    },
  });
  return result;
};
