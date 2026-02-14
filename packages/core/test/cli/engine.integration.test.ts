// packages/core/test/cli/engine.integration.test.ts

import { describe, it, expect } from "bun:test";
import { spawn } from "child_process";
import { join } from "path";
import { clearPidInfo, existingProcess } from "@/lib/process/pid";
import { ENGINE_NAME } from "@/lib/config/constants";

describe("engine lifecycle integration", () => {
  it("should create PID on run and clean on stop", async () => {
    // Clean up any existing
    await clearPidInfo(ENGINE_NAME);

    // Start engine in background
    const cliPath = join(process.cwd(), "apps", "cli", "main.ts");
    const child = spawn("bun", [cliPath, "engine", "run"], {
      detached: true,
      stdio: "ignore",
    });

    // Wait a bit for startup
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check PID exists
    const pidResult = await existingProcess(ENGINE_NAME);
    expect(pidResult.existing).toBe(true);

    // Stop engine (simulate SIGINT)
    if (child.pid) {
      process.kill(child.pid, "SIGINT");
    }

    // Wait for shutdown
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check PID cleaned
    const pidResult2 = await existingProcess(ENGINE_NAME);
    expect(pidResult2.existing).toBe(false);

    // Clean up
    child.kill();
  }, 10000); // Timeout for integration test
});
