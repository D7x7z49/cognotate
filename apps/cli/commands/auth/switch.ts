// apps/cli/commands/auth/switch.ts

import { infoHumanByHostNickname } from "@cognotate/core/lib/human";
import { setCurrentIdentityId } from "@/lib/auth";
import { subCommandAuthLogger as logger } from "@/lib/logger";

export const switchAction = async (identifier: string) => {
  const parts = identifier.split("@");
  if (parts.length !== 2) {
    logger.fail("Invalid format. Use: nickname@host");
    return;
  }

  const [nickname, host] = [parts[0]!, parts[1]!];

  logger.step(`Looking up Human "${identifier}"`);

  const human = await infoHumanByHostNickname({ host, nickname });

  if (!human) {
    logger.fail(
      `Human "${identifier}" not found. Run 'cognotate auth list' to see available humans.`,
    );
    return;
  }

  await setCurrentIdentityId(human.identity.id);
  logger.find(`Switched to "${identifier}"`);
};
