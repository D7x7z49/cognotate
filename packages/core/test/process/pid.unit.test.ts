// packages/core/test/process/pid.unit.test.ts

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { join } from "path";
import { mkdirSync, rmSync } from "fs";
import { setPidInfo, clearPidInfo } from "@/lib/process/pid";
import type { PidInfo } from "@/lib/process/pid";

// Use a temp directory for tests
const testPidRoot = join(process.cwd(), "tmp", "test-pids");

// Mock PID_ROOT
mock.module("@/lib/config", () => ({
  PID_ROOT: testPidRoot,
}));

describe("PID management", () => {
  beforeEach(() => {
    // Create temp dir
    mkdirSync(testPidRoot, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    rmSync(testPidRoot, { recursive: true, force: true });
  });

  it("should clear PID info and delete file", async () => {
    const pidInfo: PidInfo = {
      name: "test-engine",
      pid: 12345,
      startTime: Date.now(),
    };

    // Set PID info
    await setPidInfo(pidInfo);

    // Verify file exists
    const filePath = join(testPidRoot, "test-engine.pid");
    expect(await Bun.file(filePath).exists()).toBe(true);

    // Clear PID info
    await clearPidInfo("test-engine");

    // Verify file is deleted
    expect(await Bun.file(filePath).exists()).toBe(false);
  });

  it("should not error if PID file does not exist", async () => {
    // Clear non-existent PID
    expect(clearPidInfo("non-existent")).resolves.toBeUndefined();

    // No file should exist
    const filePath = join(testPidRoot, "non-existent.pid");
    expect(await Bun.file(filePath).exists()).toBe(false);
  });
});
