// packages/core/lib/logger/index.ts

const createLogger = (tags: string[] = []) => {
  const format = (symbol: string, message: string): string => {
    const tagPart = tags.map((t) => `[${t}]`).join(" ");
    return tagPart ? `${symbol} ${tagPart} ${message}` : `${symbol} ${message}`;
  };

  return {
    tag: (tag: string) => createLogger([...tags, tag]),
    sect: (msg: string) => console.info(format("[=]", `${msg} Begin`)),
    done: (msg: string) => console.info(format("[=]", `${msg} Done.`)),
    step: (msg: string) => console.info(format("[-]", msg)),
    work: (msg: string) => console.info(format("[*]", msg)),
    find: (msg: string) => console.info(format("[+]", msg)),
    warn: (msg: string) => console.warn(format("[?]", msg)),
    fail: (msg: string) => console.error(format("[!]", msg)),
    log: (msg: string) => console.log(msg),
  };
};

/**
 * sect & done: for major sections, e.g. "Initializing configuration".
 * rarely used – typically only at program startup and shutdown.
 */
export const logger = createLogger();
