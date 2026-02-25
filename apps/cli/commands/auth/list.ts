// apps/cli/commands/auth/list.ts

import { listHuman } from "@cognotate/core/lib/human";
import { subCommandAuthLogger as logger } from "@/lib/logger";

export const listAction = async () => {
  const { humans, total } = await listHuman({
    take: 100,
    skip: 0,
    orderBy: "desc",
  });

  if (total === 0) {
    logger.fail("No humans found. Run 'cognotate auth login' first.");
    return;
  }

  logger.step(`Found ${total} human(s):`);
  for (const human of humans) {
    logger.log(`${human.nickname}@${human.host} (${human.identity.id})`);
  }
};
