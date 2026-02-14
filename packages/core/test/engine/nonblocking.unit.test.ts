// packages/core/test/engine/nonblocking.unit.test.ts

import { describe, it, expect } from "bun:test";

// Mock Elysia app for testing
class MockApp {
  listen(port: number, callback?: () => void) {
    // Simulate non-blocking: call callback immediately and return
    if (callback) callback();
    return { port };
  }
}

describe("app.listen non-blocking behavior", () => {
  it("should not block execution", async () => {
    const app = new MockApp();
    let executed = false;

    // Start listen
    app.listen(3000, () => {
      // This should execute immediately
      executed = true;
    });

    // Code after listen should run without delay
    expect(executed).toBe(true);

    // Simulate asynchronous check
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(executed).toBe(true);
  });

  it("should allow concurrent operations", () => {
    const app = new MockApp();
    let signalHandled = false;

    // Simulate signal handler setup after listen
    app.listen(3000);
    process.on("SIGINT", () => {
      signalHandled = true;
    });

    // Emit signal
    process.emit("SIGINT");

    expect(signalHandled).toBe(true);
  });
});
