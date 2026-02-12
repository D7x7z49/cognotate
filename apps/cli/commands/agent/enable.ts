// apps/cli/commands/agent/enable.ts

import { toggleAgentEnabled } from "@cognotate/core/lib/agent";

export const enableAgentAction = async (nickname: string) => {
  try {
    const result = await toggleAgentEnabled(nickname, true);

    if (!result.success) {
      console.error(`Failed to enable agent: ${result.data}`);
      process.exit(1);
    }

    console.log(`Agent "${result.data.nickname}" enabled successfully`);
  } catch (error) {
    console.error(
      `Failed to enable agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};
