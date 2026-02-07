// scripts/archive-exp.mjs

import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { log } from "./utils/log.mjs";

log.sect("Archive Experiment");

const projectRoot = join(import.meta.dir, "..");
const archiveDir = join(projectRoot, "archive");

log.step("Creating archive directory");
await mkdir(archiveDir, { recursive: true });

log.step("Generating archive filename");
const timestamp = Date.now();
const filename = `exp-${timestamp}.tar.gz`;
const outputPath = join(archiveDir, filename);

log.work("Creating archive file");
await Bun.Archive.write(
  outputPath,
  {
    "share/": join(projectRoot, "share"),
    "tmp/": join(projectRoot, "tmp"),
  },
  { compress: "gzip" },
);

log.find(`Archive created at: archive/${filename}`);
log.end("Archive Experiment");
