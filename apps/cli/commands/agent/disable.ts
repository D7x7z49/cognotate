// apps/cli/commands/agent/disable.ts

import { toggleAgentEnabled } from "@cognotate/core/lib/agent";

export const disableAgentAction = async (nickname: string) => {
  try {
    const result = await toggleAgentEnabled(nickname, false);

    if (!result.success) {
      console.error(`Failed to disable agent: ${result.data}`);
      process.exit(1);
    }

    console.log(`Agent "${result.data.nickname}" disabled successfully`);
  } catch (error) {
    console.error(
      `Failed to disable agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
