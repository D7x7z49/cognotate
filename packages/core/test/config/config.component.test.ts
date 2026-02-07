// packages/core/test/config/config.component.test.ts

import { describe, it, expect, beforeEach } from "bun:test";
import { getConfig, refreshConfig } from "@/lib/config";

describe("config", () => {
  beforeEach(() => {
    // Reset global state before each test
    globalThis.__cognotate_config = undefined;
  });

  it("should return a config object", async () => {
    const config = await getConfig();
    expect(config).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.database.type).toBe("sqlite");
  });

  it("should cache config and return same instance", async () => {
    const config1 = await getConfig();
    const config2 = await getConfig();
    expect(config1).toEqual(config2);
  });

  it("should refresh config and return new instance", async () => {
    const config1 = await getConfig();
    const config2 = await refreshConfig();
    expect(config1).not.toBe(config2);
    expect(config2.database.type).toBe("sqlite");
  });
});
