// scripts/check-headers.mjs
// Automate relative path header insertion with LogLight compliance

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// =============================================================================
//  LOGLIGHT UTILITIES
// =============================================================================

const log = {
  sect: (n) => console.log(`[=] ${n} Start`),
  end:  (n) => console.log(`[=] ${n} Complete`),
  step: (n) => console.log(`[-] ${n}`),
  work: (n) => console.log(`[*] ${n}`),
  find: (n) => console.log(`[+] ${n}`),
  warn: (n) => console.log(`[?] ${n}`),
  fail: (n) => console.error(`[!] ${n}`),
};

// =============================================================================
//  CONFIGURATION
// =============================================================================

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const IGNORE_LIST = new Set([
  ".git", "node_modules", "dist", "build", "generated", ".next", ".DS_Store"
]);

// Extension to Comment Style Mapping
const RULES = {
  "//":   ["js", "ts", "jsx", "tsx", "mjs", "cjs", "mts", "cts", "java"],
  "#":    ["py", "sh", "yaml", "yml", "dockerfile"],
  "--":   ["sql", "lua"],
  "/*":   ["css", "scss", "less"],
  "<!--": ["html", "xml", "vue", "svg"],
};

// =============================================================================
//  HELPER FUNCTIONS
// =============================================================================

function getStyle(file) {
  const ext = extname(file).slice(1).toLowerCase();
  for (const [token, exts] of Object.entries(RULES)) {
    if (exts.includes(ext)) {
      const end = (token === "/*") ? " */" : (token === "<!--") ? " -->" : "";
      return { start: token + " ", end };
    }
  }
  return null;
}

function makeHeader(file, style) {
  const path = relative(ROOT, file).replace(/\\/g, "/");
  return `${style.start}${path}${style.end}`;
}

function getInsertLine(lines, header) {
  // Check if header exists
  if (lines[0]?.trim() === header.trim()) return -1;

  // Check for Shebang or XML declaration
  const first = lines[0] || "";
  if (first.startsWith("#!") || first.startsWith("<?xml")) {
    if (lines[1]?.trim() === header.trim()) return -1;
    return 1;
  }
  return 0;
}

// =============================================================================
//  CORE LOGIC
// =============================================================================

async function scan(dir) {
  let files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_LIST.has(entry.name)) continue;

    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await scan(path));
    } else {
      if (getStyle(path)) files.push(path);
    }
  }
  return files;
}

async function processFile(file) {
  try {
    const style = getStyle(file);
    const raw = await readFile(file, "utf-8");
    const lines = raw.split("\n");
    const header = makeHeader(file, style);

    const idx = getInsertLine(lines, header);

    if (idx === -1) return "skipped";

    lines.splice(idx, 0, header);
    await writeFile(file, lines.join("\n"));
    return "added";

  } catch (err) {
    return "error";
  }
}

// =============================================================================
//  MAIN EXECUTION
// =============================================================================

async function main() {
  const target = process.argv[2] || ".";
  const start = Date.now();

  log.sect("Check Headers");

  // Phase 1: Scan
  log.step("Scan directory structure");
  log.work(`Target: ${target}`);

  const files = await scan(join(process.cwd(), target));
  log.find(`Found ${files.length} supported files`);

  if (files.length === 0) {
    log.end("Check Headers");
    return;
  }

  // Phase 2: Process
  log.step("Apply file headers");

  const stats = { added: 0, skipped: 0, error: 0 };

  for (const file of files) {
    const res = await processFile(file);
    stats[res]++;

    if (res === "added") {
      log.find(`Added: ${relative(ROOT, file)}`);
    } else if (res === "error") {
      log.fail(`Error: ${relative(ROOT, file)}`);
    }
  }

  // Phase 3: Summary
  log.step("Process summary");

  if (stats.added > 0)   log.find(`Modified ${stats.added} files`);
  if (stats.skipped > 0) log.warn(`Skipped ${stats.skipped} files (valid)`);
  if (stats.error > 0)   log.fail(`Failed ${stats.error} files`);

  const time = ((Date.now() - start) / 1000).toFixed(2);
  log.work(`Time taken: ${time}s`);

  log.end("Check Headers");
}

main().catch(err => {
  log.fail(err.message);
  process.exit(1);
});
