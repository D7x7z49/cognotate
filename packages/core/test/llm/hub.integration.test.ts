// packages/core/test/llm/hub.integration.test.ts

import { test, describe, expect } from "bun:test";

import { generateText } from "ai";
import { getProviderHub } from "@/lib/llm";

describe("ProviderHub - DeepSeek Connectivity", () => {
  test.skipIf(!Bun.env.DEEPSEEK_API_KEY)(
    "should connect to DeepSeek and generate text",
    async () => {
      const hub = await getProviderHub();
      expect(hub).toBeDefined();

      const { text } = await generateText({
        model: hub.languageModel("deepseek:deepseek-chat"),
        prompt: "Say 'Hello, DeepSeek!'",
      });

      expect(typeof text).toBe("string");
      expect(text.length).toBeGreaterThan(0);
    },
    15000,
  );
});
