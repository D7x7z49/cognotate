// packages/core/lib/process/pid.ts

import { join } from "path";
import { PID_ROOT } from "@/lib/config";

export interface PidInfo {
  name: string;
  pid: number;
  startTime: number;
}

export interface PidReturn {
  existing: boolean;
  info?: PidInfo;
  error?: string;
}

const getPidFilePath = (name: string) => {
  return join(PID_ROOT, `${name}.pid`);
};

export const setPidInfo = async (pidInfo: PidInfo): Promise<void> => {
  const pidFilePath = getPidFilePath(pidInfo.name);
  const file = Bun.file(pidFilePath);
  await file.write(JSON.stringify(pidInfo));
};

export const clearPidInfo = async (name: string): Promise<void> => {
  const pidFilePath = getPidFilePath(name);
  const file = Bun.file(pidFilePath);
  if (await file.exists()) {
    await file.delete();
  }
};

export const existingProcess = async (name: string): Promise<PidReturn> => {
  const pidFilePath = getPidFilePath(name);
  const file = Bun.file(pidFilePath);
  if (await file.exists()) {
    try {
      const content = await file.text();
      const pidInfo: PidInfo = JSON.parse(content);
      // check if process is running
      try {
        process.kill(pidInfo.pid, 0);
        return { existing: true, info: pidInfo };
      } catch (err) {
        // process not running, clear pid file
        await file.delete();
        return { existing: false, error: "Process not running" };
      }
    } catch (err) {
      return { existing: false, error: "Invalid PID file" };
    }
  } else {
    return { existing: false, error: "PID file not found" };
  }
};
