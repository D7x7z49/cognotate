#!/usr/bin/env bun
// scripts/auxiliary/deepwiki.ts

/**
 * deepwiki — minimal CLI for exploring DeepWiki MCP
 *
 * purpose:
 *   fetch repository documentation via MCP and persist locally for reuse
 *
 * commands:
 *   structure <repo> [--refresh]
 *     fetch or read cached documentation index
 *     output to stdout
 *
 *   wiki <repo>
 *     fetch full documentation dump
 *     write to file only (no stdout)
 *
 *   ask <repo> <question>
 *     query repository with natural language
 *     output to stdout and record history
 *
 * storage:
 *   ~/.deepwiki/<repo>/
 *     README.md        # structure (index)
 *     wiki.md          # full documentation (large)
 *     questions/
 *       <timestamp>.md # ask history
 *
 * notes:
 *   wiki is a full document and large in size
 *   prefer 'structure' to locate sections before reading
 */

import { mkdir } from "node:fs/promises";

const URL = "https://mcp.deepwiki.com/mcp";
const ROOT = `${Bun.env.HOME}/.deepwiki`;

// ---------- core ----------

async function call(tool: string, args: any): Promise<string> {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  let buffer = "";

  for await (const chunk of res.body!) {
    buffer += Buffer.from(chunk).toString();

    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const json = JSON.parse(line.slice(6));

      if (json.error) throw new Error(json.error.message);

      const out = json.result?.content?.[0]?.text;
      if (out) return out;
    }
  }

  throw new Error("invalid response");
}

// ---------- utils ----------

const repoDir = (repo: string) => `${ROOT}/${repo}`;
const now = () => new Date().toISOString().replace(/[:.]/g, "-");

// ---------- commands ----------

async function structure([repo, ...rest]: string[]) {
  if (!repo) throw new Error("structure <repo> [--refresh]");

  const refresh = rest.includes("--refresh");
  const path = `${repoDir(repo)}/README.md`;

  if (!refresh) {
    try {
      const file = Bun.file(path);
      if (await file.exists()) {
        const text = await file.text();
        console.log(text);
        return "";
      }
    } catch {}
  }

  const out = await call("read_wiki_structure", { repoName: repo });

  await mkdir(repoDir(repo), { recursive: true });
  await Bun.write(path, out);

  return out;
}

async function wiki([repo]: string[]) {
  if (!repo) throw new Error("wiki <repo>");

  const out = await call("read_wiki_contents", { repoName: repo });

  const dir = repoDir(repo);
  const path = `${dir}/wiki.md`;

  await mkdir(dir, { recursive: true });
  await Bun.write(path, out);

  console.log(`saved: ${path}`);
  console.log(
    "NOTE: wiki is a full document and LARGE in size. it is NOT suitable for direct reading. use 'structure' to locate sections, then read with a proper tool.",
  );

  return "";
}

async function ask([repo, ...q]: string[]) {
  if (!repo || q.length === 0) throw new Error("ask <repo> <question>");

  const question = q.join(" ");

  const out = await call("ask_question", {
    repoName: repo,
    question,
  });

  const dir = `${repoDir(repo)}/questions`;
  const path = `${dir}/${now()}.md`;

  try {
    await mkdir(dir, { recursive: true });
    await Bun.write(
      path,
      `# QUESTION about "${repo}"\n<!-- BEGIN:QUESTION -->\n${question}\n<!-- END:QUESTION -->\n<!-- BEGIN:REPLIED -->\n${out}\n<!-- END:REPLIED -->`,
    );
  } catch (e) {
    console.error("Warn: failed to save question");
  }

  return out;
}

// ---------- cli ----------

const cmds: Record<string, (args: string[]) => Promise<string>> = {
  ask,
  wiki,
  structure,
};

const usage = `
deepwiki <cmd> ...

cmds:
  ask <repo> <question>
  wiki <repo>
  structure <repo> [--refresh]

TIP: if need proxy, set environment variable.
`;

async function main(argv: string[]) {
  const [cmd, ...args] = argv;

  if (!cmd || !cmds[cmd]) {
    console.log(usage.trim());
    return 1;
  }

  try {
    const out = await cmds[cmd](args);
    if (out) console.log(out);
    return 0;
  } catch (e: any) {
    console.error("Error:", e.message);
    return 1;
  }
}

main(process.argv.slice(2)).then((code) => process.exit(code));
