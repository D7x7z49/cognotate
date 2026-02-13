// scripts/clean-workspaces.mjs

import { rm, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" assert { type: "json" };
import { log } from "./utils/log.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function getWorkspaceDirs() {
  const patterns = pkg.workspaces?.packages || [];
  if (!patterns.length) return [];

  const dirs = [];

  for (const pattern of patterns) {
    if (!pattern.endsWith("/*")) continue;

    const base = pattern.slice(0, -2);
    const basePath = path.join(ROOT, base);

    try {
      const entries = await readdir(basePath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          dirs.push(path.join(base, entry.name));
        }
      }
    } catch (e) {
      if (e.code !== "ENOENT") {
        log.fail(`Cannot read ${base}: ${e.message}`);
      }
    }
  }

  return dirs;
}

log.sect("Clean dist");

let success = 0;
let skipped = 0;
let failed = 0;

const workspaceDirs = await getWorkspaceDirs();

for (const ws of workspaceDirs) {
  const dist = path.join(ROOT, ws, "dist");

  try {
    await stat(dist);
    await rm(dist, { recursive: true, force: true });
    log.work(`Cleaned ${ws}/dist`);
    success++;
  } catch (e) {
    if (e.code === "ENOENT") {
      log.step(`Skipped ${ws} (no dist)`);
      skipped++;
    } else {
      log.fail(`Failed ${ws}/dist => ${e.message}`);
      failed++;
    }
  }
}

log.step(`Success: ${success} | Skipped: ${skipped} | Failed: ${failed}`);
log.end("Clean dist");
