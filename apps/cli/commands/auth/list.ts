// apps/cli/commands/auth/list.ts

import { listHuman } from "@cognotate/core/lib/human";
import { cliLogger } from "@/lib/logger";

export const listAction = async () => {
  const { humans, total } = await listHuman({
    take: 100,
    skip: 0,
    orderBy: "desc",
  });

  if (total === 0) {
    cliLogger.fail("No humans found. Run 'cognotate auth login' first.");
    return;
  }

  cliLogger.step(`Found ${total} human(s):`);
  for (const human of humans) {
    cliLogger.log(`${human.nickname}@${human.host} (${human.identity.id})`);
  }
};
