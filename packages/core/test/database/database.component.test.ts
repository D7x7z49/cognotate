// packages/core/test/database/database.component.test.ts
import { test, describe, expect, mock, beforeEach } from "bun:test";
import { getPrisma } from "@/lib/database";

mock.module("@cognotate/config", () => ({
  getConfig: mock(() =>
    Promise.resolve({
      database: { type: "sqlite", url: ":memory:" },
    }),
  ),
}));

describe("database", () => {
  beforeEach(() => {
    // Reset global state before each test
    globalThis.__cognotate_prisma = undefined;
  });

  test("getPrisma returns PrismaClient instance", async () => {
    const prisma = await getPrisma();

    // Verify it's a PrismaClient instance
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  test("getPrisma caches instance across calls", async () => {
    const prisma1 = await getPrisma();
    const prisma2 = await getPrisma();

    // Should return the same cached instance
    expect(prisma1).toBe(prisma2);
  });
});
