// packages/core/lib/logger/pino/pino.ts

import pino, { type Logger, type LoggerOptions } from "pino";
import { getConfig } from "@/lib/config";

declare global {
  var __cognotate_logger:
    | {
        current: Logger | undefined;
        promise: Promise<Logger> | null;
      }
    | undefined;
}

const getLoggerState = () => {
  if (!globalThis.__cognotate_logger) {
    globalThis.__cognotate_logger = {
      current: undefined,
      promise: null,
    };
  }
  return globalThis.__cognotate_logger;
};

const createLogger = async (options?: LoggerOptions): Promise<Logger> => {
  const config = await getConfig();
  const logConfig = config.log;

  const logger = pino({
    ...options,
    level: logConfig.level,
  });

  return logger;
};

const getLogger = (options?: LoggerOptions): Promise<Logger> => {
  const state = getLoggerState();

  if (state.current) {
    return Promise.resolve(state.current);
  }

  if (!state.promise) {
    state.promise = (async () => {
      const logger = await createLogger(options);
      state.current = logger;
      state.promise = null;
      return logger;
    })();
  }
  return state.promise;
};

export { getLogger };
