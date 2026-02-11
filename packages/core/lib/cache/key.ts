// packages/core/lib/cache/key.ts
// Fluent, functional, minimal.

import { join as pathJoin } from "path";

type Part = string | number | boolean | null | undefined;

type KeyOpts = {
  namespace?: string; // e.g. "namespace"
  sep?: string; // e.g. ":"
  encode?: boolean; // URL-encode segments
  filepath?: boolean;
};

const KEY_SAFE = /^[a-zA-Z0-9\-._:]+$/;

function enc(v: string, on: boolean) {
  return on ? encodeURIComponent(v) : v;
}

/** Pure builder: every method returns a new instance */
export class Key {
  constructor(
    private readonly opts: Readonly<Required<KeyOpts>>,
    private readonly parts: Readonly<string[]> = [],
  ) {}

  /** Append segments; skip null/undefined/"" */
  add(...keys: Part[]): Key {
    const next: string[] = [];
    for (const key of keys) {
      if (key === null || key === undefined) continue;
      const text = String(key);
      if (!text) continue;
      if (!KEY_SAFE.test(text)) {
        throw new Error(`cache key segment unsafe: "${text}"`);
      }
      next.push(enc(text, this.opts.encode));
    }
    return new Key(this.opts, this.parts.concat(next));
  }

  /** Go up N levels (default 1) */
  up(n = 1): Key {
    const drop = Math.max(0, Math.min(n, this.parts.length));
    return new Key(this.opts, this.parts.slice(0, this.parts.length - drop));
  }

  /** Keep only the first segment (prefix) */
  root(): Key {
    return new Key(
      this.opts,
      this.parts.slice(0, Math.min(1, this.parts.length)),
    );
  }

  /** Climb until a segment matches; keep the matched one */
  until(test: string | RegExp): Key {
    const re = typeof test === "string" ? new RegExp(`^${test}$`) : test;
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const part = this.parts[i];
      if (part && re.test(part))
        return new Key(this.opts, this.parts.slice(0, i + 1));
    }
    return this;
  }

  /** Build key or pattern */
  build(opt?: { pattern?: boolean }): string {
    const { namespace, sep, filepath } = this.opts;

    if (filepath) {
      // Use path.join for cross-platform file path construction
      const parts = namespace ? [namespace, ...this.parts] : this.parts;
      return pathJoin(...parts.filter(Boolean));
    }

    // Original string concatenation logic
    const head = namespace ? [namespace] : [];
    const base = head.concat(this.parts as string[]).join(sep);
    return opt?.pattern ? base + sep + "*" : base;
  }

  /** String coercion */
  toString() {
    return this.build();
  }
}

/** Factory for creating keys - requires complete configuration */
export function createKeys(opts: Required<KeyOpts>) {
  const cfg = Object.freeze({ ...opts });
  const from = (...parts: Part[]) => new Key(cfg).add(...parts);

  return { from };
}
