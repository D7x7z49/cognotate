// packages/core/lib/logger/loglight.ts

const createLoglight = (tags: string[] = []) => {
  const format = (symbol: string, message: string): string => {
    const tagPart = tags.map((t) => `[${t}]`).join(" ");
    return tagPart ? `${symbol} ${tagPart} ${message}` : `${symbol} ${message}`;
  };

  return {
    // tag: Creates a tagged logger for scoping messages. Chain for context.
    tag: (tag: string) => createLoglight([...tags, tag]),
    // sect: Marks major program sections (startup/shutdown). Use sparingly for clarity.
    sect: (msg: string) => console.info(format("[=]", `${msg} Begin`)),
    // done: Indicates completion of sect. Pair with sect for lifecycle tracking.
    done: (msg: string) => console.info(format("[=]", `${msg} Done.`)),
    // step: Logs individual process steps. Use for key progress points, avoid noise.
    step: (msg: string) => console.info(format("[-]", msg)),
    // work: Notes ongoing work or tasks. Prefer for actionable insights.
    work: (msg: string) => console.info(format("[*]", msg)),
    // find: Reports discoveries or findings. Use for important data or results.
    find: (msg: string) => console.info(format("[+]", msg)),
    // warn: Alerts potential issues. Ensure warnings are actionable.
    warn: (msg: string) => console.warn(format("[?]", msg)),
    // fail: Logs errors with context. Include details for debugging.
    fail: (msg: string) => console.error(format("[!]", msg)),
    // log: Fallback for unformatted output. Minimize use; prefer semantic methods.
    log: (msg: string) => console.log(msg),
  };
};

export const loglight = createLoglight();
